import React, { useState, useEffect } from 'react'
import {
  Plus, Eye, Pencil, Trash2, Search,
  ChevronLeft, ChevronRight, RefreshCw, X, History,
} from 'lucide-react'
import {
  getReclassements, createReclassement, updateReclassement, deleteReclassement,
  type ReclassementFromAPI, type ReclassementPayload,
} from '../services/reclassementService'
import { ReclassementForm } from '../components/ReclassementForm'
import '../styles/pages/Reclassement.css'

const CATEGORIE_COLORS: Record<string, { bg: string; color: string }> = {
  A1: { bg: '#1a1f3c18', color: '#1a1f3c' },
  A2: { bg: '#1a4d8c18', color: '#1a4d8c' },
  B1: { bg: '#27ae6018', color: '#27ae60' },
  B2: { bg: '#1a6b3c18', color: '#1a6b3c' },
  C1: { bg: '#8c6d1a18', color: '#8c6d1a' },
  C2: { bg: '#f39c1218', color: '#d68910' },
  D:  { bg: '#c0392b18', color: '#c0392b' },
}

type ViewMode = 'liste' | 'historique'

const fmt = (date: string | null | undefined) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const ReclassementPage: React.FC = () => {
  const [reclassements, setReclassements]   = useState<ReclassementFromAPI[]>([])
  const [loading, setLoading]               = useState(true)
  const [search, setSearch]                 = useState('')
  const [viewMode, setViewMode]             = useState<ViewMode>('liste')
  const [showForm, setShowForm]             = useState(false)
  const [editReclassement, setEditReclassement] = useState<ReclassementFromAPI | null>(null)
  const [viewReclassement, setViewReclassement] = useState<ReclassementFromAPI | null>(null)
  const [page, setPage]                     = useState(1)
  const [lastPage, setLastPage]             = useState(1)
  const [total, setTotal]                   = useState(0)
  const [error, setError]                   = useState<string | null>(null)

  // ── Chargement
  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getReclassements({ page, per_page: 15 })
      const raw = res.data.data ?? res.data ?? []
      setReclassements(raw)
      if (res.data.meta) {
        setLastPage(res.data.meta.last_page ?? 1)
        setTotal(res.data.meta.total ?? raw.length)
      }
    } catch {
      setError('Impossible de charger les reclassements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page])

  // ── Filtrage local 
  const filtered = reclassements.filter(r => {
    const q = search.toLowerCase()
    const agent = r.carriere?.agent
    return (
      agent?.nom?.toLowerCase().includes(q) ||
      agent?.prenoms?.toLowerCase().includes(q) ||
      agent?.num_matricule?.toLowerCase().includes(q) ||
      r.categ_reclassement?.toLowerCase().includes(q) ||
      r.carriere?.grade?.toLowerCase().includes(q)
    )
  })

  // ── Groupement par agent pour l'historique 
  const groupedByAgent = filtered.reduce<Record<string, ReclassementFromAPI[]>>((acc, r) => {
    const agent = r.carriere?.agent
    const key   = agent ? `${agent.num_matricule} — ${agent.nom} ${agent.prenoms}` : 'Agent inconnu'
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  // ── Sauvegarde 
  const handleSave = async (data: ReclassementPayload) => {
    try {
      if (editReclassement) {
        await updateReclassement(editReclassement.Id_reclassement, data)
        alert('Reclassement modifié avec succès')
      } else {
        await createReclassement(data)
        alert('Reclassement créé avec succès')
      }
      load()
      setShowForm(false)
      setEditReclassement(null)
    } catch (err: any) {
      const v = err.response?.data?.errors
      alert(v
        ? 'Erreurs :\n' + Object.values(v).flat().join('\n')
        : err.response?.data?.message ?? 'Erreur lors de la sauvegarde'
      )
      throw err
    }
  }

  // ── Suppression 
  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce reclassement ?')) return
    try {
      await deleteReclassement(id)
      alert('Reclassement supprimé')
      load()
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur lors de la suppression')
    }
  }

  const openEdit = (r: ReclassementFromAPI) => { setEditReclassement(r); setShowForm(true) }
  const openAdd  = () => { setEditReclassement(null); setShowForm(true) }

  return (
    <div className="rp-page">

      {/* Header */}
      <div className="rp-header">
        <div>
          <h1 className="rp-title">Reclassements</h1>
          <p className="rp-subtitle">{total} reclassement{total > 1 ? 's' : ''} enregistré{total > 1 ? 's' : ''}</p>
        </div>
        <div className="rp-header-actions">
          <button className="rp-btn-secondary" onClick={load}>
            <RefreshCw size={14} /> Actualiser
          </button>
          <button className="rp-btn-primary" onClick={openAdd}>
            <Plus size={15} /> Nouveau reclassement
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="rp-alert">
          ⚠ {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Onglets Liste / Historique */}
      <div className="rp-tabs">
        <button
          className={`rp-tab ${viewMode === 'liste' ? 'active' : ''}`}
          onClick={() => setViewMode('liste')}
        >
          <RefreshCw size={14} /> Liste des reclassements
        </button>
        <button
          className={`rp-tab ${viewMode === 'historique' ? 'active' : ''}`}
          onClick={() => setViewMode('historique')}
        >
          <History size={14} /> Historique par agent
        </button>
      </div>

      {/* Recherche */}
      <div className="rp-search-wrapper">
        <div className="rp-search-box">
          <Search className="rp-search-icon" size={14} />
          <input
            type="text"
            className="rp-search-input"
            placeholder="Rechercher par agent, catégorie, grade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── VUE LISTE ── */}
      {viewMode === 'liste' && (
        <div className="rp-table-wrapper">
          <table className="rp-table">
            <thead>
              <tr>
                {['Agent', 'Grade / Carrière', 'Ancienne Cat.', 'Nouvelle Cat.', 'Date reclassement', 'Effet solde', 'Effet ancienneté', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr key="loading">
                  <td colSpan={8} className="rp-empty">
                    <span className="rp-spinner" /> Chargement...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr key="empty">
                  <td colSpan={8} className="rp-empty">Aucun reclassement trouvé</td>
                </tr>
              )}
              {!loading && filtered.map((r, i) => {
                const agent  = r.carriere?.agent
                const catNew = CATEGORIE_COLORS[r.categ_reclassement] ?? { bg: '#f0f0f0', color: '#666' }
                const catOld = CATEGORIE_COLORS[r.carriere?.Categorie ?? ''] ?? { bg: '#f0f0f0', color: '#666' }
                const rowKey = r.Id_reclassement ?? `recl-${i}`
                return (
                  <tr key={rowKey} className={`rp-row ${i % 2 === 0 ? 'rp-row-even' : 'rp-row-odd'}`}>
                    <td>
                      {agent ? (
                        <>
                          <div className="rp-agent-name">{agent.civilite} {agent.nom}</div>
                          <div className="rp-agent-mat">{agent.num_matricule}</div>
                        </>
                      ) : <span className="rp-cell-gray">—</span>}
                    </td>
                    <td>
                      <div className="rp-grade">{r.carriere?.grade || '—'}</div>
                      {r.carriere?.echelon && (
                        <div className="rp-cell-gray">{r.carriere.echelon}ème échelon</div>
                      )}
                    </td>
                    <td>
                      <span className="rp-badge" style={{ background: catOld.bg, color: catOld.color }}>
                        {r.carriere?.Categorie || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="rp-badge" style={{ background: catNew.bg, color: catNew.color }}>
                        {r.categ_reclassement || '—'}
                      </span>
                    </td>
                    <td className="rp-cell-date">{fmt(r.date_reclassement)}</td>
                    <td className="rp-cell-date">{fmt(r.date_effet_solde)}</td>
                    <td className="rp-cell-date">{fmt(r.date_effet_anciennete)}</td>
                    <td>
                      <div className="rp-actions">
                        <button className="rp-icon-btn" title="Voir" onClick={() => setViewReclassement(r)}>
                          <Eye size={13} />
                        </button>
                        <button className="rp-icon-btn rp-icon-btn--edit" title="Modifier" onClick={() => openEdit(r)}>
                          <Pencil size={13} />
                        </button>
                        <button className="rp-icon-btn rp-icon-btn--delete" title="Supprimer" onClick={() => handleDelete(r.Id_reclassement)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="rp-pagination">
              <span className="rp-pagination-info">Page {page} sur {lastPage} · {total} reclassements</span>
              <div className="rp-pagination-buttons">
                <button className="rp-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} title="Précédent">
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: lastPage }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                      <React.Fragment key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && <span key={`ellipsis-${p}`} className="rp-ellipsis">…</span>}
                        <button key={`page-${p}`} className={`rp-page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                      </React.Fragment>
                    ))
                }
                <button className="rp-page-btn" onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage} title="Suivant">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── VUE HISTORIQUE ── */}
      {viewMode === 'historique' && (
        <div className="rp-historique">
          {loading ? (
            <div className="rp-empty"><span className="rp-spinner" /> Chargement...</div>
          ) : Object.keys(groupedByAgent).length === 0 ? (
            <div className="rp-empty">Aucun historique trouvé</div>
          ) : Object.entries(groupedByAgent).map(([agentKey, items]) => (
            <div key={agentKey} className="rp-hist-group">
              {/* En-tête agent */}
              <div className="rp-hist-agent-header">
                <div className="rp-hist-agent-avatar">
                  {agentKey.split('—')[1]?.trim().charAt(0) ?? '?'}
                </div>
                <div>
                  <div className="rp-hist-agent-name">{agentKey.split('—')[1]?.trim()}</div>
                  <div className="rp-hist-agent-mat">{agentKey.split('—')[0]?.trim()}</div>
                </div>
                <span className="rp-hist-count">{items.length} reclassement{items.length > 1 ? 's' : ''}</span>
              </div>

              {/* Timeline */}
              <div className="rp-timeline">
                {[...items]
                  .sort((a, b) => new Date(a.date_reclassement).getTime() - new Date(b.date_reclassement).getTime())
                  .map((r, idx) => {
                    const catNew = CATEGORIE_COLORS[r.categ_reclassement]   ?? { bg: '#f0f0f0', color: '#666' }
                    const catOld = CATEGORIE_COLORS[r.carriere?.Categorie ?? ''] ?? { bg: '#f0f0f0', color: '#666' }
                    const isLast = idx === items.length - 1
                      const tlKey = r.Id_reclassement ?? `tl-${idx}`
                      return (
                        <div key={tlKey} className="rp-timeline-item">
                        {/* Ligne verticale */}
                        <div className="rp-timeline-line-wrapper">
                          <div className={`rp-timeline-dot ${isLast ? 'latest' : ''}`} />
                          {!isLast && <div className="rp-timeline-line" />}
                        </div>

                        {/* Contenu */}
                        <div className="rp-timeline-content">
                          <div className="rp-timeline-header">
                            <div className="rp-timeline-date">{fmt(r.date_reclassement)}</div>
                            <div className="rp-timeline-transition">
                              <span className="rp-badge" style={{ background: catOld.bg, color: catOld.color }}>
                                {r.carriere?.Categorie || '?'}
                              </span>
                              <span className="rp-timeline-arrow">→</span>
                              <span className="rp-badge" style={{ background: catNew.bg, color: catNew.color }}>
                                {r.categ_reclassement}
                              </span>
                            </div>
                            <div className="rp-timeline-actions">
                              <button className="rp-icon-btn" onClick={() => setViewReclassement(r)} title="Voir"><Eye size={12} /></button>
                              <button className="rp-icon-btn rp-icon-btn--edit" onClick={() => openEdit(r)} title="Modifier"><Pencil size={12} /></button>
                              <button className="rp-icon-btn rp-icon-btn--delete" onClick={() => handleDelete(r.Id_reclassement)} title="Supprimer"><Trash2 size={12} /></button>
                            </div>
                          </div>
                          <div className="rp-timeline-details">
                            <span>💰 Effet solde : <strong>{fmt(r.date_effet_solde)}</strong></span>
                            <span>⏳ Effet ancienneté : <strong>{fmt(r.date_effet_anciennete)}</strong></span>
                            {r.observation && <span>📝 {r.observation}</span>}
                          </div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal détail */}
      {viewReclassement && (
        <div className="rp-modal-overlay">
          <div className="rp-modal">
            <div className="rp-modal-header">
              <div className="rp-modal-header-content">
                <div className="rp-modal-icon"><History size={20} /></div>
                <div>
                  <div className="rp-modal-title">Reclassement #{viewReclassement.Id_reclassement}</div>
                  <div className="rp-modal-sub">
                    {viewReclassement.carriere?.agent
                      ? `${viewReclassement.carriere.agent.civilite} ${viewReclassement.carriere.agent.nom} ${viewReclassement.carriere.agent.prenoms}`
                      : '—'}
                  </div>
                </div>
              </div>
              <button className="rp-modal-close" onClick={() => setViewReclassement(null)} title="Fermer">
                <X size={16} />
              </button>
            </div>

            <div className="rp-modal-body">
              {/* Transition */}
              <div className="rp-modal-transition">
                <div className="rp-modal-cat-block">
                  <span className="rp-modal-cat-label">Catégorie précédente</span>
                  <span className="rp-badge rp-badge--lg"
                    style={CATEGORIE_COLORS[viewReclassement.carriere?.Categorie ?? ''] ?? { background: '#f0f0f0', color: '#666' }}>
                    {viewReclassement.carriere?.Categorie || '—'}
                  </span>
                </div>
                <span className="rp-modal-arrow">→</span>
                <div className="rp-modal-cat-block">
                  <span className="rp-modal-cat-label">Nouvelle catégorie</span>
                  <span className="rp-badge rp-badge--lg"
                    style={CATEGORIE_COLORS[viewReclassement.categ_reclassement] ?? { background: '#f0f0f0', color: '#666' }}>
                    {viewReclassement.categ_reclassement}
                  </span>
                </div>
              </div>

              {/* Détails */}
              <p className="rp-modal-section-title">Dates</p>
              <div className="rp-modal-grid">
                {[
                  { label: 'Date de reclassement',    value: fmt(viewReclassement.date_reclassement) },
                  { label: 'Date d\'effet solde',      value: fmt(viewReclassement.date_effet_solde) },
                  { label: 'Date d\'effet ancienneté', value: fmt(viewReclassement.date_effet_anciennete) },
                  { label: 'Carrière (grade)',         value: viewReclassement.carriere?.grade || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="rp-modal-field">
                    <div className="rp-modal-field-label">{label}</div>
                    <div className="rp-modal-field-value">{value}</div>
                  </div>
                ))}
              </div>

              {viewReclassement.observation && (
                <div className="rp-modal-observation">
                  <p className="rp-modal-section-title">Observation</p>
                  <p className="rp-modal-obs-text">{viewReclassement.observation}</p>
                </div>
              )}
            </div>

            <div className="rp-modal-footer">
              <button className="rp-btn-secondary" onClick={() => setViewReclassement(null)}>Fermer</button>
              <button className="rp-btn-primary" onClick={() => { setViewReclassement(null); openEdit(viewReclassement) }}>
                <Pencil size={13} /> Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <ReclassementForm
          reclassement={editReclassement}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditReclassement(null) }}
        />
      )}
    </div>
  )
}