import React, { useState, useRef, useEffect } from 'react'
import { Bell, X, Check, CheckCheck, Filter, Trash2 } from 'lucide-react'
import type { Notification, NotifCategorie } from '../data/notifications'
import {
  NOTIFICATIONS_MOCK,
  NOTIF_CATEGORIES,
  NOTIF_PRIORITE,
} from '../data/notifications'

// ── Helpers ───────────────────────────────────────────────────────────────────

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
  { key: 'all',       label: 'Tout',       emoji: '🔔' },
  { key: 'agent',     label: 'Agents',     emoji: '👤' },
  { key: 'affectation',label:'Affectation',emoji: '🔀' },
  { key: 'promotion', label: 'Promotion',  emoji: '📈' },
  { key: 'contrat',   label: 'Contrats',   emoji: '📄' },
  { key: 'retraite',  label: 'Retraite',   emoji: '🏖️' },
  { key: 'paie',      label: 'Paie',       emoji: '💰' },
  { key: 'audit',     label: 'Audit',      emoji: '🔒' },
  { key: 'famille',   label: 'Famille',    emoji: '👶' },
  { key: 'diplome',   label: 'Diplômes',   emoji: '🎓' },
]

// ── Composant ─────────────────────────────────────────────────────────────────

export const NotificationPanel: React.FC = () => {
  const [open, setOpen]             = useState(false)
  const [notifs, setNotifs]         = useState<Notification[]>(NOTIFICATIONS_MOCK)
  const [activeFilter, setActiveFilter] = useState<NotifCategorie | 'all'>('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Fermer si clic en dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const nonLues = notifs.filter(n => !n.lue).length

  const filtered = notifs.filter(n => {
    const matchCat  = activeFilter === 'all' || n.categorie === activeFilter
    const matchLue  = !showUnreadOnly || !n.lue
    return matchCat && matchLue
  })

  const markLue       = (id: number) => setNotifs(p => p.map(n => n.id === id ? { ...n, lue: true } : n))
  const markAll       = ()           => setNotifs(p => p.map(n => ({ ...n, lue: true })))
  const deleteNotif   = (id: number) => setNotifs(p => p.filter(n => n.id !== id))
  const clearAll      = ()           => setNotifs([])

  // Compter par catégorie
  const countByCat = (cat: NotifCategorie | 'all') =>
    cat === 'all'
      ? notifs.filter(n => !n.lue).length
      : notifs.filter(n => n.categorie === cat && !n.lue).length

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>

      {/* ── Bouton Bell ── */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          position: 'relative', background: 'none', border: 'none',
          cursor: 'pointer', color: open ? '#1a1f3c' : '#9aa3b5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '36px', height: '36px', borderRadius: '8px',
          transition: 'background 0.15s, color 0.15s',
          
        }}
      >
        <Bell size={18} />
        {nonLues > 0 && (
          <span style={{
            position: 'absolute', top: '2px', right: '2px',
            background: '#c0392b', color: '#fff',
            borderRadius: '50%', minWidth: '16px', height: '16px',
            fontSize: '9px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 3px', border: '2px solid #fff',
            fontFamily: 'DM Sans, sans-serif',
          }}>
            {nonLues > 99 ? '99+' : nonLues}
          </span>
        )}
      </button>

      {/* ── Panel ── */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
          width: '420px', maxHeight: '600px',
          background: '#fff', borderRadius: '16px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.16)',
          border: '1px solid #e2e6ef',
          display: 'flex', flexDirection: 'column',
          zIndex: 9999, overflow: 'hidden',
        }}>

          {/* Header panel */}
          <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #f0f2f7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#1a1f3c' }}>Notifications</span>
                {nonLues > 0 && (
                  <span style={{ background: '#c0392b', color: '#fff', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>
                    {nonLues} non lue{nonLues > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {nonLues > 0 && (
                  <button onClick={markAll} title="Tout marquer comme lu" style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #e2e6ef', background: '#fff', fontSize: '11px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: '#5a6478', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <CheckCheck size={12} /> Tout lire
                  </button>
                )}
                <button onClick={clearAll} title="Effacer tout" style={{ padding: '5px', borderRadius: '6px', border: '1px solid #e2e6ef', background: '#fff', cursor: 'pointer', color: '#9aa3b5', display: 'flex', alignItems: 'center' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Toggle non lues seulement */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setShowUnreadOnly(v => !v)}
                style={{
                  padding: '4px 10px', borderRadius: '20px', border: '1px solid',
                  borderColor: showUnreadOnly ? '#1a1f3c' : '#e2e6ef',
                  background: showUnreadOnly ? '#1a1f3c' : '#fff',
                  color: showUnreadOnly ? '#fff' : '#9aa3b5',
                  fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                <Filter size={10} /> Non lues seulement
              </button>
              <span style={{ fontSize: '11px', color: '#9aa3b5' }}>{filtered.length} notification{filtered.length > 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Filtres catégories — scrollable horizontal */}
          <div style={{ display: 'flex', gap: '6px', padding: '10px 18px', overflowX: 'auto', borderBottom: '1px solid #f0f2f7', flexShrink: 0 }}>
            {CATS_FILTER.map(cat => {
              const count = countByCat(cat.key)
              const active = activeFilter === cat.key
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveFilter(cat.key)}
                  style={{
                    padding: '5px 10px', borderRadius: '20px', border: '1px solid',
                    borderColor: active ? '#1a1f3c' : '#e2e6ef',
                    background: active ? '#1a1f3c' : '#fff',
                    color: active ? '#fff' : '#5a6478',
                    fontSize: '11px', fontWeight: active ? 700 : 500,
                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                    display: 'flex', alignItems: 'center', gap: '4px',
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  {cat.emoji} {cat.label}
                  {count > 0 && (
                    <span style={{ background: active ? 'rgba(255,255,255,0.25)' : '#c0392b', color: '#fff', borderRadius: '50%', minWidth: '15px', height: '15px', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2px' }}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Liste notifications */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔔</div>
                <p style={{ fontSize: '13px', color: '#9aa3b5', fontWeight: 500 }}>Aucune notification</p>
                <p style={{ fontSize: '12px', color: '#c5ccd9', marginTop: '4px' }}>
                  {showUnreadOnly ? 'Toutes les notifications ont été lues' : 'Rien à afficher'}
                </p>
              </div>
            ) : (
              filtered.map((n, i) => {
                const cat = NOTIF_CATEGORIES[n.categorie]
                const prio = NOTIF_PRIORITE[n.priorite]
                return (
                  <div
                    key={n.id}
                    style={{
                      padding: '12px 18px',
                      borderBottom: i < filtered.length - 1 ? '1px solid #f8f9fc' : 'none',
                      background: n.lue ? '#fff' : '#f8f9ff',
                      display: 'flex', gap: '12px', alignItems: 'flex-start',
                      transition: 'background 0.15s',
                      cursor: n.lue ? 'default' : 'pointer',
                    }}
                    onClick={() => !n.lue && markLue(n.id)}
                  >
                    {/* Icône catégorie */}
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: cat.bg, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px',
                    }}>
                      {cat.emoji}
                    </div>

                    {/* Contenu */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '13px', fontWeight: n.lue ? 500 : 700, color: '#1a1f3c', lineHeight: 1.3 }}>
                          {n.titre}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                          {!n.lue && (
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#c0392b', flexShrink: 0 }} />
                          )}
                          <span style={{ fontSize: '10px', color: '#9aa3b5', whiteSpace: 'nowrap' }}>{timeAgo(n.date)}</span>
                        </div>
                      </div>

                      <p style={{ fontSize: '12px', color: '#5a6478', lineHeight: 1.4, marginBottom: '6px' }}>
                        {n.message}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {/* Badge catégorie */}
                        <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: cat.bg, color: cat.color }}>
                          {cat.emoji} {cat.label}
                        </span>
                        {/* Badge priorité */}
                        {n.priorite !== 'info' && (
                          <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: `${prio.color}15`, color: prio.color }}>
                            {n.priorite === 'haute' ? '⚠️ Urgent' : '• Moyen'}
                          </span>
                        )}
                        {/* Agent matricule */}
                        {n.agent_matricule && (
                          <span style={{ fontSize: '10px', color: '#9aa3b5', fontFamily: 'DM Mono, monospace' }}>
                            {n.agent_matricule}
                          </span>
                        )}
                        {/* Boutons actions */}
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                          {!n.lue && (
                            <button
                              onClick={e => { e.stopPropagation(); markLue(n.id) }}
                              title="Marquer comme lu"
                              style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid #e2e6ef', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#27ae60' }}
                            >
                              <Check size={11} />
                            </button>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); deleteNotif(n.id) }}
                            title="Supprimer"
                            style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid #e2e6ef', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b' }}
                          >
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
          <div style={{ padding: '10px 18px', borderTop: '1px solid #f0f2f7', background: '#f8f9fc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#9aa3b5' }}>
              {notifs.length} total · {nonLues} non lue{nonLues > 1 ? 's' : ''}
            </span>
            <button onClick={() => setOpen(false)} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #e2e6ef', background: '#fff', fontSize: '11px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: '#5a6478', fontWeight: 600 }}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}