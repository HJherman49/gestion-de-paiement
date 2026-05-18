import React, { useState, useEffect, useCallback } from 'react'
import {
  Search, Trash2, ChevronLeft, ChevronRight,
  Activity, Clock, User, Database, Filter, X, RefreshCw,
} from 'lucide-react'
import {
  getHistoriques, getHistoriqueStats, deleteHistorique,
  type HistoriqueFromAPI, type HistoriqueFilters,
  type TypeAction, type HistoriqueStats,
} from '../services/historiqueService'
import '../styles/pages/HistoriquePage.css'

type TabKey = 'logs' | 'modifications' | 'utilisateurs'

// ── Config couleurs par action ──────────────────────────────────────────────
const ACTION_CONFIG: Record<TypeAction, { label: string; bg: string; color: string; icon: string }> = {
  CREATE: { label: 'Création',     bg: '#27ae6018', color: '#27ae60', icon: '✚' },
  UPDATE: { label: 'Modification', bg: '#2980b918', color: '#2980b9', icon: '✎' },
  DELETE: { label: 'Suppression',  bg: '#c0392b18', color: '#c0392b', icon: '✕' },
}

// ── Noms lisibles des tables ────────────────────────────────────────────────
const TABLE_LABELS: Record<string, string> = {
  agents:           'Agents',
  carrieres:        'Carrières',
  paies:            'Paies',
  reclassements:    'Reclassements',
  fonctions:        'Fonctions',
  preembauches:     'Préembauches',
  enfants:          'Enfants',
  compte_bancaires: 'Comptes bancaires',
  directions:       'Directions',
  services:         'Services',
  divisions:        'Divisions',
  baremes:          'Barèmes',
  banques:          'Banques',
  statuts:          'Statuts',
  contrats:         'Contrats',
  diplomes:         'Diplômes',
}

const tableLabel = (t: string) => TABLE_LABELS[t] ?? t

const fmt = (date: string | null | undefined) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const fmtDate = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

export const HistoriquePage: React.FC = () => {
  const [tab, setTab]                   = useState<TabKey>('logs')
  const [historiques, setHistoriques]   = useState<HistoriqueFromAPI[]>([])
  const [stats, setStats]               = useState<HistoriqueStats | null>(null)
  const [loading, setLoading]           = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [page, setPage]                 = useState(1)
  const [lastPage, setLastPage]         = useState(1)
  const [total, setTotal]               = useState(0)
  const [error, setError]               = useState<string | null>(null)
  const [detailItem, setDetailItem]     = useState<HistoriqueFromAPI | null>(null)

  // Filtres
  const [search, setSearch]             = useState('')
  const [filterTable, setFilterTable]   = useState('')
  const [filterAction, setFilterAction] = useState<TypeAction | ''>('')
  const [filterUser, setFilterUser]     = useState('')
  const [filterDateDeb, setFilterDateDeb] = useState('')
  const [filterDateFin, setFilterDateFin] = useState('')
  const [showFilters, setShowFilters]   = useState(false)

  // ── Chargement ────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const filters: HistoriqueFilters = {
        page, per_page: 20,
        search:          search || undefined,
        table_concernee: filterTable || undefined,
        type_action:     filterAction || undefined,
        utilisateur:     filterUser || undefined,
        date_debut:      filterDateDeb || undefined,
        date_fin:        filterDateFin || undefined,
      }
      const res = await getHistoriques(filters)
      setHistoriques(res.data.data ?? [])
      if (res.data.meta) {
        setLastPage(res.data.meta.last_page ?? 1)
        setTotal(res.data.meta.total ?? 0)
      }
    } catch { setError('Impossible de charger l\'historique') }
    finally { setLoading(false) }
  }, [page, search, filterTable, filterAction, filterUser, filterDateDeb, filterDateFin])

  const loadStats = async () => {
    setLoadingStats(true)
    try {
      const res = await getHistoriqueStats()
      setStats(res.data)
    } catch {}
    finally { setLoadingStats(false) }
  }

  useEffect(() => { load() }, [load])
  useEffect(() => { loadStats() }, [])

  const resetFilters = () => {
    setSearch(''); setFilterTable(''); setFilterAction('')
    setFilterUser(''); setFilterDateDeb(''); setFilterDateFin('')
    setPage(1)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette entrée de l\'historique ?')) return
    try { await deleteHistorique(id); load(); loadStats() }
    catch (err: any) { alert(err.response?.data?.message ?? 'Erreur') }
  }

  // ── Groupement par utilisateur (vue utilisateurs) ─────────────────────────
  const groupedByUser = historiques.reduce<Record<string, HistoriqueFromAPI[]>>((acc, h) => {
    const key = h.utilisateur ?? 'Inconnu'
    if (!acc[key]) acc[key] = []
    acc[key].push(h)
    return acc
  }, {})

  // Tables uniques pour le filtre
  const tablesUniques = [...new Set(historiques.map(h => h.table_concernee))].sort()

  const hasActiveFilters = !!(filterTable || filterAction || filterUser || filterDateDeb || filterDateFin)

  return (
    <div className="hp-page">

      {/* Header */}
      <div className="hp-header">
        <div>
          <h1 className="hp-title">Historique & Audit</h1>
          <p className="hp-subtitle">{total} entrée{total > 1 ? 's' : ''} dans les logs</p>
        </div>
        <div className="hp-header-actions">
          <button className="hp-btn-secondary" onClick={() => { load(); loadStats() }}>
            <RefreshCw size={14} /> Actualiser
          </button>
          <button
            className={`hp-btn-secondary ${showFilters ? 'active' : ''} ${hasActiveFilters ? 'has-filter' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={14} /> Filtres
            {hasActiveFilters && <span className="hp-filter-dot" />}
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && <div className="hp-alert">⚠ {error}<button onClick={() => setError(null)}>×</button></div>}

      {/* Stats globales */}
      {!loadingStats && stats && (
        <div className="hp-stats-row">
          <div className="hp-stat-card hp-stat-create">
            <span className="hp-stat-icon">✚</span>
            <div>
              <span className="hp-stat-value">{stats.par_action.find(a => a.type_action === 'CREATE')?.total ?? 0}</span>
              <span className="hp-stat-label">Créations</span>
            </div>
          </div>
          <div className="hp-stat-card hp-stat-update">
            <span className="hp-stat-icon">✎</span>
            <div>
              <span className="hp-stat-value">{stats.par_action.find(a => a.type_action === 'UPDATE')?.total ?? 0}</span>
              <span className="hp-stat-label">Modifications</span>
            </div>
          </div>
          <div className="hp-stat-card hp-stat-delete">
            <span className="hp-stat-icon">✕</span>
            <div>
              <span className="hp-stat-value">{stats.par_action.find(a => a.type_action === 'DELETE')?.total ?? 0}</span>
              <span className="hp-stat-label">Suppressions</span>
            </div>
          </div>
          <div className="hp-stat-card hp-stat-today">
            <Clock size={16} style={{ color: '#8c6d1a' }} />
            <div>
              <span className="hp-stat-value">{stats.aujourd_hui}</span>
              <span className="hp-stat-label">Aujourd'hui</span>
            </div>
          </div>
          <div className="hp-stat-card hp-stat-week">
            <Activity size={16} style={{ color: '#1a4d8c' }} />
            <div>
              <span className="hp-stat-value">{stats.cette_semaine}</span>
              <span className="hp-stat-label">Cette semaine</span>
            </div>
          </div>
        </div>
      )}

      {/* Filtres avancés */}
      {showFilters && (
        <div className="hp-filters-panel">
          <div className="hp-filters-grid">
            <div className="hp-filter-field">
              <label className="hp-filter-label">Recherche</label>
              <div className="hp-search-box">
                <Search className="hp-search-icon" size={13} />
                <input className="hp-search-input"
                  placeholder="Champ, valeur, utilisateur..."
                  value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
              </div>
            </div>
            <div className="hp-filter-field">
              <label className="hp-filter-label">Table</label>
              <select className="hp-filter-select" value={filterTable}
                onChange={e => { setFilterTable(e.target.value); setPage(1) }} title="Table concernée">
                <option value="">Toutes les tables</option>
                {Object.entries(TABLE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="hp-filter-field">
              <label className="hp-filter-label">Action</label>
              <select className="hp-filter-select" value={filterAction}
                onChange={e => { setFilterAction(e.target.value as TypeAction | ''); setPage(1) }} title="Type d'action">
                <option value="">Toutes les actions</option>
                <option value="CREATE">✚ Création</option>
                <option value="UPDATE">✎ Modification</option>
                <option value="DELETE">✕ Suppression</option>
              </select>
            </div>
            <div className="hp-filter-field">
              <label className="hp-filter-label">Utilisateur</label>
              <input className="hp-filter-input"
                placeholder="Nom de l'utilisateur..."
                value={filterUser} onChange={e => { setFilterUser(e.target.value); setPage(1) }} />
            </div>
            <div className="hp-filter-field">
              <label className="hp-filter-label">Date début</label>
              <input type="date" className="hp-filter-input"
                value={filterDateDeb} onChange={e => { setFilterDateDeb(e.target.value); setPage(1) }} title="Date début" />
            </div>
            <div className="hp-filter-field">
              <label className="hp-filter-label">Date fin</label>
              <input type="date" className="hp-filter-input"
                value={filterDateFin} onChange={e => { setFilterDateFin(e.target.value); setPage(1) }} title="Date fin" />
            </div>
          </div>
          {hasActiveFilters && (
            <button className="hp-filter-reset" onClick={resetFilters}>
              <X size={12} /> Effacer tous les filtres
            </button>
          )}
        </div>
      )}

      {/* Onglets */}
      <div className="hp-tabs">
        <button className={`hp-tab ${tab === 'logs' ? 'active' : ''}`} onClick={() => setTab('logs')}>
          <Database size={14} /> Logs complets
        </button>
        <button className={`hp-tab ${tab === 'modifications' ? 'active' : ''}`} onClick={() => setTab('modifications')}>
          <Activity size={14} /> Modifications champ par champ
        </button>
        <button className={`hp-tab ${tab === 'utilisateurs' ? 'active' : ''}`} onClick={() => setTab('utilisateurs')}>
          <User size={14} /> Par utilisateur
        </button>
      </div>

      {/* ── VUE LOGS COMPLETS ── */}
      {tab === 'logs' && (
        <div className="hp-table-wrapper">
          <table className="hp-table">
            <thead>
              <tr>
                {['#', 'Action', 'Table', 'ID enreg.', 'Champ modifié', 'Utilisateur', 'Date & heure', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="hp-empty"><span className="hp-spinner" /> Chargement...</td></tr>
              ) : historiques.length === 0 ? (
                <tr><td colSpan={8} className="hp-empty">Aucune entrée trouvée</td></tr>
              ) : historiques.map((h, i) => {
                const cfg = ACTION_CONFIG[h.type_action]
                return (
                  <tr key={h.Id_historique}
                    className={`hp-row ${i % 2 === 0 ? 'hp-row-even' : 'hp-row-odd'} hp-row-clickable`}
                    onClick={() => setDetailItem(h)}
                  >
                    <td><span className="hp-id">#{h.Id_historique}</span></td>
                    <td>
                      <span className="hp-action-badge" style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </td>
                    <td><span className="hp-table-badge">{tableLabel(h.table_concernee)}</span></td>
                    <td><span className="hp-enreg-id">#{h.id_enregistrement}</span></td>
                    <td>
                      {h.champ_modifie
                        ? <span className="hp-champ">{h.champ_modifie}</span>
                        : <span className="hp-cell-gray">—</span>}
                    </td>
                    <td>
                      {h.utilisateur
                        ? <span className="hp-user"><User size={11} /> {h.utilisateur}</span>
                        : <span className="hp-cell-gray">Système</span>}
                    </td>
                    <td className="hp-cell-date">{fmt(h.date_action)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="hp-icon-btn hp-icon-btn--delete" title="Supprimer"
                        onClick={() => handleDelete(h.Id_historique)}>
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {renderPagination()}
        </div>
      )}

      {/* ── VUE MODIFICATIONS CHAMP PAR CHAMP ── */}
      {tab === 'modifications' && (
        <div className="hp-table-wrapper">
          <table className="hp-table">
            <thead>
              <tr>
                {['Date', 'Table / ID', 'Champ modifié', 'Avant', 'Après', 'Utilisateur'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="hp-empty"><span className="hp-spinner" /> Chargement...</td></tr>
              ) : historiques.filter(h => h.type_action === 'UPDATE' || h.champ_modifie).length === 0 ? (
                <tr><td colSpan={6} className="hp-empty">Aucune modification enregistrée</td></tr>
              ) : historiques
                  .filter(h => h.type_action === 'UPDATE' && h.champ_modifie)
                  .map((h, i) => (
                <tr key={h.Id_historique} className={`hp-row ${i % 2 === 0 ? 'hp-row-even' : 'hp-row-odd'} hp-row-clickable`}
                  onClick={() => setDetailItem(h)}>
                  <td className="hp-cell-date">{fmt(h.date_action)}</td>
                  <td>
                    <div className="hp-table-badge">{tableLabel(h.table_concernee)}</div>
                    <div className="hp-enreg-id">#{h.id_enregistrement}</div>
                  </td>
                  <td><span className="hp-champ">{h.champ_modifie}</span></td>
                  <td>
                    <div className="hp-valeur hp-valeur--avant">
                      {h.valeur_avant
                        ? <span title={h.valeur_avant}>{h.valeur_avant.length > 40 ? h.valeur_avant.slice(0, 40) + '…' : h.valeur_avant}</span>
                        : <span className="hp-cell-gray">—</span>}
                    </div>
                  </td>
                  <td>
                    <div className="hp-valeur hp-valeur--apres">
                      {h.valeur_apres
                        ? <span title={h.valeur_apres}>{h.valeur_apres.length > 40 ? h.valeur_apres.slice(0, 40) + '…' : h.valeur_apres}</span>
                        : <span className="hp-cell-gray">—</span>}
                    </div>
                  </td>
                  <td>
                    <span className="hp-user"><User size={11} /> {h.utilisateur ?? 'Système'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {renderPagination()}
        </div>
      )}

      {/* ── VUE PAR UTILISATEUR ── */}
      {tab === 'utilisateurs' && (
        <div className="hp-users-view">
          {loading ? (
            <div className="hp-empty"><span className="hp-spinner" /> Chargement...</div>
          ) : Object.keys(groupedByUser).length === 0 ? (
            <div className="hp-empty">Aucun utilisateur trouvé</div>
          ) : (
            <>
              {/* Top utilisateurs (depuis stats) */}
              {stats && stats.par_user.length > 0 && (
                <div className="hp-top-users">
                  <p className="hp-section-label">Top utilisateurs (total)</p>
                  <div className="hp-top-users-list">
                    {stats.par_user.slice(0, 5).map((u, i) => (
                      <div key={u.utilisateur} className="hp-top-user-card">
                        <div className="hp-top-user-rank">#{i + 1}</div>
                        <div className="hp-top-user-avatar">{u.utilisateur.charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="hp-top-user-name">{u.utilisateur}</div>
                          <div className="hp-top-user-count">{u.total} action{u.total > 1 ? 's' : ''}</div>
                        </div>
                        <div className="hp-top-user-bar-wrapper">
                          <div className="hp-top-user-bar"
                            style={{ width: `${(u.total / (stats.par_user[0]?.total ?? 1)) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Logs groupés par utilisateur */}
              {Object.entries(groupedByUser).map(([user, items]) => (
                <div key={user} className="hp-user-group">
                  <div className="hp-user-group-header">
                    <div className="hp-user-avatar">{user.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="hp-user-name">{user}</div>
                      <div className="hp-user-count">{items.length} action{items.length > 1 ? 's' : ''} dans cette page</div>
                    </div>
                    <div className="hp-user-actions-summary">
                      {(['CREATE', 'UPDATE', 'DELETE'] as TypeAction[]).map(action => {
                        const count = items.filter(h => h.type_action === action).length
                        if (!count) return null
                        const cfg = ACTION_CONFIG[action]
                        return (
                          <span key={action} className="hp-action-badge" style={{ background: cfg.bg, color: cfg.color }}>
                            {cfg.icon} {count}
                          </span>
                        )
                      })}
                    </div>
                  </div>

                  <div className="hp-user-logs">
                    {items.slice(0, 5).map(h => {
                      const cfg = ACTION_CONFIG[h.type_action]
                      return (
                        <div key={h.Id_historique} className="hp-user-log-item"
                          onClick={() => setDetailItem(h)}>
                          <span className="hp-action-dot" style={{ background: cfg.color }} />
                          <span className="hp-table-badge" style={{ fontSize: '10px' }}>{tableLabel(h.table_concernee)}</span>
                          <span className="hp-action-badge" style={{ background: cfg.bg, color: cfg.color, fontSize: '10px' }}>
                            {cfg.label}
                          </span>
                          {h.champ_modifie && <span className="hp-champ" style={{ fontSize: '11px' }}>{h.champ_modifie}</span>}
                          <span className="hp-cell-date" style={{ marginLeft: 'auto', fontSize: '11px' }}>{fmt(h.date_action)}</span>
                        </div>
                      )
                    })}
                    {items.length > 5 && (
                      <div className="hp-user-more">+{items.length - 5} autres entrées</div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Modal détail entrée */}
      {detailItem && (
        <div className="hp-modal-overlay">
          <div className="hp-modal">
            <div className="hp-modal-header" style={{
              borderLeft: `4px solid ${ACTION_CONFIG[detailItem.type_action].color}`
            }}>
              <div>
                <div className="hp-modal-title">
                  <span className="hp-action-badge"
                    style={{ background: ACTION_CONFIG[detailItem.type_action].bg, color: ACTION_CONFIG[detailItem.type_action].color }}>
                    {ACTION_CONFIG[detailItem.type_action].icon} {ACTION_CONFIG[detailItem.type_action].label}
                  </span>
                  <span className="hp-modal-table">{tableLabel(detailItem.table_concernee)} #{detailItem.id_enregistrement}</span>
                </div>
                <div className="hp-modal-sub">
                  <User size={11} /> {detailItem.utilisateur ?? 'Système'} · {fmt(detailItem.date_action)}
                </div>
              </div>
              <button className="hp-modal-close" onClick={() => setDetailItem(null)} title="Fermer"><X size={16} /></button>
            </div>

            <div className="hp-modal-body">
              {detailItem.champ_modifie && (
                <div className="hp-modal-champ">
                  <p className="hp-modal-field-label">Champ modifié</p>
                  <span className="hp-champ hp-champ--lg">{detailItem.champ_modifie}</span>
                </div>
              )}

              {(detailItem.valeur_avant || detailItem.valeur_apres) && (
                <div className="hp-modal-diff">
                  <div className="hp-modal-diff-col hp-modal-diff-col--avant">
                    <p className="hp-modal-field-label">Valeur avant</p>
                    <div className="hp-modal-valeur hp-modal-valeur--avant">
                      {detailItem.valeur_avant
                        ? <pre className="hp-pre">{
                            (() => { try { return JSON.stringify(JSON.parse(detailItem.valeur_avant), null, 2) } catch { return detailItem.valeur_avant } })()
                          }</pre>
                        : <span className="hp-cell-gray">— (aucune valeur)</span>}
                    </div>
                  </div>
                  <div className="hp-modal-diff-arrow">→</div>
                  <div className="hp-modal-diff-col hp-modal-diff-col--apres">
                    <p className="hp-modal-field-label">Valeur après</p>
                    <div className="hp-modal-valeur hp-modal-valeur--apres">
                      {detailItem.valeur_apres
                        ? <pre className="hp-pre">{
                            (() => { try { return JSON.stringify(JSON.parse(detailItem.valeur_apres), null, 2) } catch { return detailItem.valeur_apres } })()
                          }</pre>
                        : <span className="hp-cell-gray">— (supprimé)</span>}
                    </div>
                  </div>
                </div>
              )}

              <div className="hp-modal-meta">
                {[
                  { label: 'ID historique',    value: `#${detailItem.Id_historique}` },
                  { label: 'Table concernée',  value: tableLabel(detailItem.table_concernee) },
                  { label: 'ID enregistrement',value: `#${detailItem.id_enregistrement}` },
                  { label: 'Utilisateur',      value: detailItem.utilisateur ?? 'Système' },
                  { label: 'Date & heure',     value: fmt(detailItem.date_action) },
                ].map(({ label, value }) => (
                  <div key={label} className="hp-modal-meta-row">
                    <span className="hp-modal-meta-label">{label}</span>
                    <span className="hp-modal-meta-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hp-modal-footer">
              <button className="hp-btn-secondary" onClick={() => setDetailItem(null)}>Fermer</button>
              <button className="hp-btn-danger" onClick={() => { handleDelete(detailItem.Id_historique); setDetailItem(null) }}>
                <Trash2 size={13} /> Supprimer cette entrée
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  function renderPagination() {
    if (lastPage <= 1) return null
    return (
      <div className="hp-pagination">
        <span className="hp-pagination-info">Page {page} sur {lastPage} · {total} entrées</span>
        <div className="hp-pagination-buttons">
          <button className="hp-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} title="Précédent">
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: lastPage }, (_, i) => i + 1)
            .filter(p => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
            .map((p, idx, arr) => (
              <React.Fragment key={p}>
                {idx > 0 && arr[idx - 1] !== p - 1 && <span className="hp-ellipsis">…</span>}
                <button className={`hp-page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              </React.Fragment>
            ))}
          <button className="hp-page-btn" onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage} title="Suivant">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    )
  }
}