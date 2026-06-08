import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Bell, X, Check, CheckCheck, Filter, Trash2, RefreshCw } from 'lucide-react'
import type { NotifCategorie } from '../data/notifications'
import { NOTIF_CATEGORIES, NOTIF_PRIORITE } from '../data/notifications'
import api from '../services/api'
import '../styles/components/Notificationpanel.css'

// ── Types 

export interface Notification {
  id:               number
  titre:            string
  message:          string
  categorie:        NotifCategorie
  priorite:         'haute' | 'moyenne' | 'info'
  date:             string
  lue:              boolean
  agent_matricule?: string
  agent_nom?:       string
  type_action?:     string
  table_concernee?: string
  utilisateur?:     string
}

// ── Helpers 

const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime()
  const min  = Math.floor(diff / 60000)
  const h    = Math.floor(diff / 3600000)
  const d    = Math.floor(diff / 86400000)
  if (min < 1)  return "À l'instant"
  if (min < 60) return `Il y a ${min} min`
  if (h   < 24) return `Il y a ${h}h`
  if (d   < 7)  return `Il y a ${d}j`
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

const CATS_FILTER: { key: NotifCategorie | 'all'; label: string; emoji: string }[] = [
  { key: 'all',        label: 'Tout',       emoji: '🔔' },
  { key: 'agent',      label: 'Agents',     emoji: '👤' },
  { key: 'affectation',label: 'Affectation',emoji: '🔀' },
  { key: 'promotion',  label: 'Promotion',  emoji: '📈' },
  { key: 'contrat',    label: 'Contrats',   emoji: '📄' },
  { key: 'retraite',   label: 'Retraite',   emoji: '🏖️' },
  { key: 'paie',       label: 'Paie',       emoji: '💰' },
  { key: 'audit',      label: 'Audit',      emoji: '🔒' },
  { key: 'famille',    label: 'Famille',    emoji: '👶' },
  { key: 'diplome',    label: 'Diplômes',   emoji: '🎓' },
]

const POLL_INTERVAL = 30_000 // 30 secondes

// ── Composant 

export const NotificationPanel: React.FC = () => {
  const [open, setOpen]                 = useState(false)
  const [notifs, setNotifs]             = useState<Notification[]>([])
  const [loading, setLoading]           = useState(false)
  const [lastFetch, setLastFetch]       = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<NotifCategorie | 'all'>('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [countdown, setCountdown]       = useState(POLL_INTERVAL / 1000)
  const panelRef   = useRef<HTMLDivElement>(null)
  const pollRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const countRef   = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Charger les notifications depuis l'API 
  const fetchNotifs = useCallback(async (isPolling = false) => {
    if (!isPolling) setLoading(true)
    try {
      const params: Record<string, string> = {}
      // Si polling → envoyer "depuis" pour ne récupérer que les nouvelles
      if (isPolling && lastFetch) params.depuis = lastFetch

      const res = await api.get('/notifications', { params })
      const data: Notification[] = res.data.data ?? []
      const serverTime: string   = res.data.server_time ?? new Date().toISOString()

      setLastFetch(serverTime)

      if (isPolling && data.length > 0) {
        // Ajouter les nouvelles notifications en tête de liste
        setNotifs(prev => {
          const existingIds = new Set(prev.map(n => n.id))
          const newOnes = data.filter(n => !existingIds.has(n.id))
          if (newOnes.length === 0) return prev
          // Jouer un son ou vibrer si nouvelles notifs urgentes
          const hasUrgent = newOnes.some(n => n.priorite === 'haute')
          if (hasUrgent) document.title = `🔴 ${newOnes.length} nouvelle(s) notification(s) — SIRH`
          setTimeout(() => { document.title = 'SIRH — INSTAT' }, 4000)
          return [...newOnes, ...prev]
        })
      } else if (!isPolling) {
        // Chargement initial
        setNotifs(data)
      }
    } catch (err) {
      console.warn('Notifications non disponibles:', err)
      // Pas d'erreur visible — les notifs restent dans l'état précédent
    } finally {
      setLoading(false)
    }
  }, [lastFetch])

  // ── Chargement initial 
  useEffect(() => {
    fetchNotifs(false)
  }, [])

  // ── Polling toutes les 30s 
  useEffect(() => {
    // Polling
    pollRef.current = setInterval(() => {
      fetchNotifs(true)
      setCountdown(POLL_INTERVAL / 1000)
    }, POLL_INTERVAL)

    // Compte à rebours
    countRef.current = setInterval(() => {
      setCountdown(prev => prev <= 1 ? POLL_INTERVAL / 1000 : prev - 1)
    }, 1000)

    return () => {
      if (pollRef.current)  clearInterval(pollRef.current)
      if (countRef.current) clearInterval(countRef.current)
    }
  }, [fetchNotifs])

  // ── Fermer si clic dehors 
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Actions 
  const nonLues     = notifs.filter(n => !n.lue).length
  const markLue     = (id: number) => setNotifs(p => p.map(n => n.id === id ? { ...n, lue: true } : n))
  const markAll     = ()           => setNotifs(p => p.map(n => ({ ...n, lue: true })))
  const deleteNotif = (id: number) => setNotifs(p => p.filter(n => n.id !== id))
  const clearAll    = ()           => setNotifs([])

  const filtered = notifs.filter(n => {
    const matchCat = activeFilter === 'all' || n.categorie === activeFilter
    const matchLue = !showUnreadOnly || !n.lue
    return matchCat && matchLue
  })

  const countByCat = (cat: NotifCategorie | 'all') =>
    cat === 'all'
      ? notifs.filter(n => !n.lue).length
      : notifs.filter(n => n.categorie === cat && !n.lue).length

  const handleRefresh = () => {
    fetchNotifs(false)
    setCountdown(POLL_INTERVAL / 1000)
    // Reset poll timer
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(() => {
      fetchNotifs(true)
      setCountdown(POLL_INTERVAL / 1000)
    }, POLL_INTERVAL)
  }

  return (
    <div ref={panelRef} className="np-wrapper">

      {/* Bouton Bell */}
      <button
        className={`np-bell-btn ${open ? 'open' : ''}`}
        onClick={() => setOpen(v => !v)}
        title="Notifications"
      >
        <Bell size={18} />
        {nonLues > 0 && (
          <span className="np-badge">{nonLues > 99 ? '99+' : nonLues}</span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="np-panel">

          {/* Header */}
          <div className="np-header">
            <div className="np-header-top">
              <div className="np-header-left">
                <span className="np-title">Notifications</span>
                {nonLues > 0 && (
                  <span className="np-unread-badge">
                    {nonLues} non lue{nonLues > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="np-header-actions">
                {/* Bouton refresh manuel + countdown */}
                <button
                  className="np-btn-refresh"
                  onClick={handleRefresh}
                  title={`Actualiser (auto dans ${countdown}s)`}
                  disabled={loading}
                >
                  <RefreshCw size={11} className={loading ? 'np-spin' : ''} />
                  <span>{loading ? '...' : `${countdown}s`}</span>
                </button>
                {nonLues > 0 && (
                  <button className="np-btn-mark-all" onClick={markAll} title="Tout marquer comme lu">
                    <CheckCheck size={12} /> Tout lire
                  </button>
                )}
                <button className="np-btn-clear" onClick={clearAll} title="Effacer tout">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Toggle non lues */}
            <div className="np-filter-row">
              <button
                className={`np-btn-unread ${showUnreadOnly ? 'active' : ''}`}
                onClick={() => setShowUnreadOnly(v => !v)}
              >
                <Filter size={10} /> Non lues seulement
              </button>
              <span className="np-filter-count">
                {filtered.length} notification{filtered.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Filtres catégories */}
          <div className="np-cats">
            {CATS_FILTER.map(cat => {
              const count  = countByCat(cat.key)
              const active = activeFilter === cat.key
              return (
                <button
                  key={cat.key}
                  className={`np-cat-btn ${active ? 'active' : ''}`}
                  onClick={() => setActiveFilter(cat.key)}
                >
                  {cat.emoji} {cat.label}
                  {count > 0 && <span className="np-cat-count">{count}</span>}
                </button>
              )
            })}
          </div>

          {/* Liste */}
          <div className="np-list">
            {loading && notifs.length === 0 ? (
              <div className="np-empty">
                <div className="np-empty-icon">
                  <RefreshCw size={24} className="np-spin" style={{ color: 'var(--instat-gray-300)' }} />
                </div>
                <p className="np-empty-title">Chargement...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="np-empty">
                <div className="np-empty-icon">🔔</div>
                <p className="np-empty-title">Aucune notification</p>
                <p className="np-empty-sub">
                  {showUnreadOnly
                    ? 'Toutes les notifications ont été lues'
                    : notifs.length === 0
                      ? 'Aucune activité récente dans le système'
                      : 'Rien à afficher dans cette catégorie'}
                </p>
              </div>
            ) : (
              filtered.map(n => {
                const cat  = NOTIF_CATEGORIES[n.categorie] ?? NOTIF_CATEGORIES['audit']
                const prio = NOTIF_PRIORITE[n.priorite]
                return (
                  <div
                    key={n.id}
                    className={`np-item ${!n.lue ? 'unread' : ''}`}
                    onClick={() => !n.lue && markLue(n.id)}
                  >
                    <div className="np-item-icon" style={{ background: cat.bg }}>
                      {cat.emoji}
                    </div>

                    <div className="np-item-body">
                      <div className="np-item-top">
                        <span className={`np-item-title ${!n.lue ? 'bold' : ''}`}>
                          {n.titre}
                        </span>
                        <div className="np-item-right">
                          {!n.lue && <span className="np-unread-dot" />}
                          <span className="np-item-time">{timeAgo(n.date)}</span>
                        </div>
                      </div>

                      <p className="np-item-msg">{n.message}</p>

                      <div className="np-item-footer">
                        <span className="np-cat-badge" style={{ background: cat.bg, color: cat.color }}>
                          {cat.emoji} {cat.label}
                        </span>
                        {n.priorite !== 'info' && (
                          <span className="np-prio-badge" style={{ background: `${prio.color}15`, color: prio.color }}>
                            {n.priorite === 'haute' ? '⚠️ Urgent' : '• Moyen'}
                          </span>
                        )}
                        {n.utilisateur && (
                          <span className="np-matricule">par {n.utilisateur}</span>
                        )}
                        <div className="np-item-actions">
                          {!n.lue && (
                            <button className="np-action-btn read" title="Marquer comme lu"
                              onClick={e => { e.stopPropagation(); markLue(n.id) }}>
                              <Check size={11} />
                            </button>
                          )}
                          <button className="np-action-btn delete" title="Supprimer"
                            onClick={e => { e.stopPropagation(); deleteNotif(n.id) }}>
                            <X size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="np-footer">
            <span className="np-footer-info">
              {notifs.length} total · {nonLues} non lue{nonLues > 1 ? 's' : ''} · actualisation dans {countdown}s
            </span>
            <button className="np-btn-close" onClick={() => setOpen(false)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  )
}