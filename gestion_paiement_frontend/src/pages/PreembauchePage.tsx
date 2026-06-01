import React, { useState, useEffect } from 'react'
import {
  Plus, Eye, Pencil, Trash2, Search,
  ChevronLeft, ChevronRight, UserCheck, Clock, FileText, X,
} from 'lucide-react'
import {
  getPreembauches, createPreembauche, updatePreembauche, deletePreembauche,
  type PreembaucheFromAPI, type PreembauchePayload,
} from '../services/preembaucheService'
import { PreembaucheForm } from '../components/PreembaucheForm'
import '../styles/pages/PreembauchePage.css'

type TabKey = 'recrutement' | 'stages' | 'contrats'

const fmt = (date: string | null | undefined) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const ar = (val: any) => val && Number(val) > 0
  ? `${Number(val).toLocaleString('fr-MG')} Ar` : '—'

const dureeDays = (deb: string, fin: string) => {
  if (!deb || !fin) return null
  const days = Math.round((new Date(fin).getTime() - new Date(deb).getTime()) / (1000 * 60 * 60 * 24))
  return days > 0 ? days : null
}

export const PreembauchePage: React.FC = () => {
  const [preembauches, setPreembauches]   = useState<PreembaucheFromAPI[]>([])
  const [loading, setLoading]             = useState(true)
  const [tab, setTab]                     = useState<TabKey>('recrutement')
  const [search, setSearch]               = useState('')
  const [showForm, setShowForm]           = useState(false)
  const [editItem, setEditItem]           = useState<PreembaucheFromAPI | null>(null)
  const [viewItem, setViewItem]           = useState<PreembaucheFromAPI | null>(null)
  const [page, setPage]                   = useState(1)
  const [lastPage, setLastPage]           = useState(1)
  const [total, setTotal]                 = useState(0)
  const [error, setError]                 = useState<string | null>(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const res = await getPreembauches({ page, per_page: 15 })
      const raw = res.data.data ?? res.data ?? []
      setPreembauches(raw)
      if (res.data.meta) {
        setLastPage(res.data.meta.last_page ?? 1)
        setTotal(res.data.meta.total ?? raw.length)
      }
    } catch { setError('Impossible de charger les préembauches') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page])

  // Filtrage
  const filtered = preembauches.filter(p => {
    const q = search.toLowerCase()
    return (
      p.agent?.nom?.toLowerCase().includes(q) ||
      p.agent?.prenoms?.toLowerCase().includes(q) ||
      p.agent?.num_matricule?.toLowerCase().includes(q) ||
      p.N_contrat?.toLowerCase().includes(q) ||
      p.contrat?.type_contrat?.toLowerCase().includes(q)
    )
  })

  const handleSave = async (data: PreembauchePayload) => {
    try {
      if (editItem) { await updatePreembauche(editItem.Id_preemb, data); alert('Préembauche modifiée') }
      else          { await createPreembauche(data); alert('Préembauche créée') }
      load(); setShowForm(false); setEditItem(null)
    } catch (err: any) {
      const v = err.response?.data?.errors
      alert(v ? 'Erreurs :\n' + Object.values(v).flat().join('\n') : err.response?.data?.message ?? 'Erreur')
      throw err
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette préembauche ?')) return
    try { await deletePreembauche(id); alert('Préembauche supprimée'); load() }
    catch (err: any) { alert(err.response?.data?.message ?? 'Erreur') }
  }

  const openEdit = (p: PreembaucheFromAPI) => { setEditItem(p); setShowForm(true) }
  const openAdd  = () => { setEditItem(null); setShowForm(true) }

  const ActionBtns = ({ item }: { item: PreembaucheFromAPI }) => (
    <div className="pep-actions">
      <button className="pep-icon-btn" title="Voir" onClick={() => setViewItem(item)}><Eye size={13} /></button>
      <button className="pep-icon-btn pep-icon-btn--edit" title="Modifier" onClick={() => openEdit(item)}><Pencil size={13} /></button>
      <button className="pep-icon-btn pep-icon-btn--delete" title="Supprimer" onClick={() => handleDelete(item.Id_preemb)}><Trash2 size={13} /></button>
    </div>
  )

  const Pagination = () => lastPage > 1 ? (
    <div className="pep-pagination">
      <span className="pep-pagination-info">Page {page} sur {lastPage} · {total} entrées</span>
      <div className="pep-pagination-buttons">
        <button className="pep-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} title="Précédent"><ChevronLeft size={14} /></button>
        {Array.from({ length: lastPage }, (_, i) => i + 1)
          .filter(p => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
          .map((p, idx, arr) => (
            <React.Fragment key={p}>
              {idx > 0 && arr[idx - 1] !== p - 1 && <span className="pep-ellipsis">…</span>}
              <button className={`pep-page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            </React.Fragment>
          ))}
        <button className="pep-page-btn" onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage} title="Suivant"><ChevronRight size={14} /></button>
      </div>
    </div>
  ) : null

  return (
    <div className="pep-page">

      {/* Header */}
      <div className="pep-header">
        <div>
          <h1 className="pep-title">Préembauche</h1>
          <p className="pep-subtitle">{total} dossier{total > 1 ? 's' : ''} enregistré{total > 1 ? 's' : ''}</p>
        </div>
        <button className="pep-btn-primary" onClick={openAdd}>
          <Plus size={15} /> Nouveau dossier
        </button>
      </div>

      {/* Erreur */}
      {error && <div className="pep-alert">⚠ {error}<button onClick={() => setError(null)}>×</button></div>}

      {/* Onglets */}
      <div className="pep-tabs">
        <button className={`pep-tab ${tab === 'recrutement' ? 'active' : ''}`} onClick={() => setTab('recrutement')}>
          <UserCheck size={14} /> Recrutement
        </button>
        <button className={`pep-tab ${tab === 'stages' ? 'active' : ''}`} onClick={() => setTab('stages')}>
          <Clock size={14} /> Stages préembauche
        </button>
        <button className={`pep-tab ${tab === 'contrats' ? 'active' : ''}`} onClick={() => setTab('contrats')}>
          <FileText size={14} /> Contrats temporaires
        </button>
      </div>

      {/* Recherche */}
      <div className="pep-search-wrapper">
        <div className="pep-search-box">
          <Search className="pep-search-icon" size={14} />
          <input className="pep-search-input"
            placeholder="Rechercher par agent, N° contrat, type contrat..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* ── RECRUTEMENT ── */}
      {tab === 'recrutement' && (
        <div className="pep-table-wrapper">
          <table className="pep-table">
            <thead>
              <tr>
                {['Agent', 'Date recrutement', 'Date recrutement 2', 'Type contrat', 'N° Contrat', 'Actions'].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="pep-empty"><span className="pep-spinner" /> Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="pep-empty">Aucun dossier trouvé</td></tr>
              ) : filtered.map((p, i) => (
                <tr key={`${p.Id_preemb ?? 'preembauche'}-${i}`} className={`pep-row ${i % 2 === 0 ? 'pep-row-even' : 'pep-row-odd'}`}>
                  <td>
                    {p.agent ? (
                      <>
                        <div className="pep-agent-name">{p.agent.civilite} {p.agent.nom}</div>
                        <div className="pep-agent-mat">{p.agent.num_matricule}</div>
                      </>
                    ) : <span className="pep-cell-gray">—</span>}
                  </td>
                  <td className="pep-cell-date">{fmt(p.Date_recrutement)}</td>
                  <td className="pep-cell-date">{fmt(p.Date_recrutement1)}</td>
                  <td>
                    {p.contrat
                      ? <span className="pep-contrat-badge">{p.contrat.type_contrat}</span>
                      : <span className="pep-cell-gray">—</span>}
                  </td>
                  <td>
                    {p.N_contrat
                      ? <span className="pep-num-contrat">{p.N_contrat}</span>
                      : <span className="pep-cell-gray">—</span>}
                  </td>
                  <td><ActionBtns item={p} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination />
        </div>
      )}

      {/* ── STAGES ── */}
      {tab === 'stages' && (
        <div className="pep-table-wrapper">
          <table className="pep-table">
            <thead>
              <tr>
                {['Agent', 'Début de stage', 'Fin de stage', 'Durée', 'Montant PreEmb', 'Actions'].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="pep-empty"><span className="pep-spinner" /> Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="pep-empty">Aucun stage trouvé</td></tr>
              ) : filtered.map((p, i) => {
                const days = dureeDays(p.Deb_stage_PreEmb, p.Fin_stage_PreEmb)
                return (
                  <tr key={`${p.Id_preemb ?? 'preembauche'}-${i}`} className={`pep-row ${i % 2 === 0 ? 'pep-row-even' : 'pep-row-odd'}`}>
                    <td>
                      {p.agent ? (
                        <>
                          <div className="pep-agent-name">{p.agent.civilite} {p.agent.nom}</div>
                          <div className="pep-agent-mat">{p.agent.num_matricule}</div>
                        </>
                      ) : <span className="pep-cell-gray">—</span>}
                    </td>
                    <td>
                      <div className="pep-cell-date">{fmt(p.Deb_stage_PreEmb)}</div>
                      {p.Deb_stage_PreEmb_txt && <div className="pep-cell-txt">{p.Deb_stage_PreEmb_txt}</div>}
                    </td>
                    <td>
                      <div className="pep-cell-date">{fmt(p.Fin_stage_PreEmb)}</div>
                      {p.Fin_stage_PreEmb_txt && <div className="pep-cell-txt">{p.Fin_stage_PreEmb_txt}</div>}
                    </td>
                    <td>
                      {days
                        ? <span className="pep-duree-badge">{days}j {days >= 30 ? `(≈${Math.round(days / 30)}m)` : ''}</span>
                        : <span className="pep-cell-gray">—</span>}
                    </td>
                    <td><span className="pep-montant">{ar(p.Montant_PreEmb)}</span></td>
                    <td><ActionBtns item={p} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <Pagination />
        </div>
      )}

      {/* ── CONTRATS ── */}
      {tab === 'contrats' && (
        <div className="pep-table-wrapper">
          <table className="pep-table">
            <thead>
              <tr>
                {['Agent', 'N° Contrat', 'Type contrat', 'Durée contrat', 'Montant contrat', 'Date recrutement', 'Actions'].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="pep-empty"><span className="pep-spinner" /> Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="pep-empty">Aucun contrat trouvé</td></tr>
              ) : filtered.map((p, i) => (
                <tr key={`${p.Id_preemb ?? 'preembauche'}-${i}`} className={`pep-row ${i % 2 === 0 ? 'pep-row-even' : 'pep-row-odd'}`}>
                  <td>
                    {p.agent ? (
                      <>
                        <div className="pep-agent-name">{p.agent.civilite} {p.agent.nom}</div>
                        <div className="pep-agent-mat">{p.agent.num_matricule}</div>
                      </>
                    ) : <span className="pep-cell-gray">—</span>}
                  </td>
                  <td>
                    {p.N_contrat
                      ? <span className="pep-num-contrat">{p.N_contrat}</span>
                      : <span className="pep-cell-gray">—</span>}
                  </td>
                  <td>
                    {p.contrat
                      ? <span className="pep-contrat-badge">{p.contrat.type_contrat}</span>
                      : <span className="pep-cell-gray">—</span>}
                  </td>
                  <td className="pep-cell-gray">{p.contrat?.duree || '—'}</td>
                  <td><span className="pep-montant-contrat">{ar(p.Montant_PreEmb_Contrat)}</span></td>
                  <td className="pep-cell-date">{fmt(p.Date_recrutement)}</td>
                  <td><ActionBtns item={p} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination />
        </div>
      )}

      {/* Modal détail */}
      {viewItem && (
        <div className="pep-modal-overlay">
          <div className="pep-modal">
            <div className="pep-modal-header">
              <div className="pep-modal-header-content">
                <div className="pep-modal-icon"><UserCheck size={20} /></div>
                <div>
                  <div className="pep-modal-title">
                    Dossier #{viewItem.Id_preemb}
                    {viewItem.N_contrat && ` — ${viewItem.N_contrat}`}
                  </div>
                  <div className="pep-modal-sub">
                    {viewItem.agent
                      ? `${viewItem.agent.civilite} ${viewItem.agent.nom} ${viewItem.agent.prenoms} · ${viewItem.agent.num_matricule}`
                      : '—'}
                  </div>
                </div>
              </div>
              <button className="pep-modal-close" onClick={() => setViewItem(null)} title="Fermer"><X size={16} /></button>
            </div>

            <div className="pep-modal-body">
              {/* Recrutement */}
              <p className="pep-modal-section-title">Recrutement</p>
              <div className="pep-modal-grid">
                {[
                  { label: 'Date recrutement',   value: fmt(viewItem.Date_recrutement) },
                  { label: 'Date recrutement 2', value: fmt(viewItem.Date_recrutement1) },
                  { label: 'N° Contrat',         value: viewItem.N_contrat || '—' },
                  { label: 'Type contrat',        value: viewItem.contrat ? `${viewItem.contrat.type_contrat} (${viewItem.contrat.duree})` : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="pep-modal-field">
                    <div className="pep-modal-field-label">{label}</div>
                    <div className="pep-modal-field-value">{value}</div>
                  </div>
                ))}
              </div>

              {/* Stage */}
              <p className="pep-modal-section-title" style={{ marginTop: 16 }}>Stage préembauche</p>
              <div className="pep-modal-grid">
                {[
                  { label: 'Début stage',          value: fmt(viewItem.Deb_stage_PreEmb) },
                  { label: 'Fin stage',             value: fmt(viewItem.Fin_stage_PreEmb) },
                  { label: 'Début (libellé)',       value: viewItem.Deb_stage_PreEmb_txt || '—' },
                  { label: 'Fin (libellé)',         value: viewItem.Fin_stage_PreEmb_txt || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="pep-modal-field">
                    <div className="pep-modal-field-label">{label}</div>
                    <div className="pep-modal-field-value">{value}</div>
                  </div>
                ))}
              </div>

              {/* Durée */}
              {dureeDays(viewItem.Deb_stage_PreEmb, viewItem.Fin_stage_PreEmb) && (
                <div className="pep-modal-duree">
                  <span>Durée du stage</span>
                  <span className="pep-modal-duree-value">
                    {dureeDays(viewItem.Deb_stage_PreEmb, viewItem.Fin_stage_PreEmb)} jours
                  </span>
                </div>
              )}

              {/* Montants */}
              <p className="pep-modal-section-title" style={{ marginTop: 16 }}>Montants</p>
              <div className="pep-modal-montants">
                <div className="pep-modal-montant-item">
                  <span className="pep-modal-montant-label">Montant préembauche</span>
                  <span className="pep-modal-montant-value">{ar(viewItem.Montant_PreEmb)}</span>
                </div>
                <div className="pep-modal-montant-item">
                  <span className="pep-modal-montant-label">Montant contrat</span>
                  <span className="pep-modal-montant-value">{ar(viewItem.Montant_PreEmb_Contrat)}</span>
                </div>
              </div>
            </div>

            <div className="pep-modal-footer">
              <button className="pep-btn-secondary" onClick={() => setViewItem(null)}>Fermer</button>
              <button className="pep-btn-primary" onClick={() => { setViewItem(null); openEdit(viewItem) }}>
                <Pencil size={13} /> Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <PreembaucheForm
          preembauche={editItem}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditItem(null) }}
        />
      )}
    </div>
  )
}