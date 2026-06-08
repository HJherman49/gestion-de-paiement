import React, { useState, useEffect } from 'react'
import {
  Plus, Eye, Pencil, Trash2, Search,
  ChevronLeft, ChevronRight, Briefcase, X,
} from 'lucide-react'
import {
  getFonctions, createFonction, updateFonction, deleteFonction,
  type FonctionFromAPI, type FonctionPayload,
} from '../services/fonctionService'
import { FonctionForm } from '../components/FonctionForm'
import '../styles/pages/FonctionPage.css'

const fmt = (date: string | null | undefined) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const ar = (val: any) =>
  val && Number(val) > 0 ? `${Number(val).toLocaleString('fr-MG')} Ar` : '—'

export const FonctionPage: React.FC = () => {
  const [fonctions, setFonctions]       = useState<FonctionFromAPI[]>([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [showForm, setShowForm]         = useState(false)
  const [editFonction, setEditFonction] = useState<FonctionFromAPI | null>(null)
  const [viewFonction, setViewFonction] = useState<FonctionFromAPI | null>(null)
  const [page, setPage]                 = useState(1)
  const [lastPage, setLastPage]         = useState(1)
  const [total, setTotal]               = useState(0)
  const [error, setError]               = useState<string | null>(null)

  // ── Chargement 
  const load = async () => {
    setLoading(true); setError(null)
    try {
      const res = await getFonctions({ page, per_page: 15 })
      const raw = res.data.data ?? res.data ?? []
      setFonctions(raw)
      if (res.data.meta) {
        setLastPage(res.data.meta.last_page ?? 1)
        setTotal(res.data.meta.total ?? raw.length)
      }
    } catch { setError('Impossible de charger les fonctions') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page])

  // ── Filtrage 
  const filtered = fonctions.filter(f => {
    const q = search.toLowerCase()
    return (
      f.nom_fonction?.toLowerCase().includes(q) ||
      f.num_fonct?.toLowerCase().includes(q) ||
      f.agent?.nom?.toLowerCase().includes(q) ||
      f.agent?.prenoms?.toLowerCase().includes(q) ||
      f.agent?.num_matricule?.toLowerCase().includes(q) ||
      f.direction?.sigle?.toLowerCase().includes(q) ||
      f.direction?.nom_direction?.toLowerCase().includes(q)
    )
  })

  // ── Sauvegarde 
  const handleSave = async (data: FonctionPayload) => {
    try {
      if (editFonction) { await updateFonction(editFonction.Id_fonction, data); alert('Fonction modifiée') }
      else              { await createFonction(data); alert('Fonction créée') }
      load(); setShowForm(false); setEditFonction(null)
    } catch (err: any) {
      const v = err.response?.data?.errors
      alert(v ? 'Erreurs :\n' + Object.values(v).flat().join('\n') : err.response?.data?.message ?? 'Erreur')
      throw err
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette fonction ?')) return
    try {
      await deleteFonction(id); alert('Fonction supprimée'); load()
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur lors de la suppression')
    }
  }

  const openEdit = (f: FonctionFromAPI) => { setEditFonction(f); setShowForm(true) }
  const openAdd  = () => { setEditFonction(null); setShowForm(true) }

  return (
    <div className="fp-page">

      {/* Header */}
      <div className="fp-header">
        <div>
          <h1 className="fp-title">Fonctions</h1>
          <p className="fp-subtitle">{total} fonction{total > 1 ? 's' : ''} enregistrée{total > 1 ? 's' : ''}</p>
        </div>
        <button className="fp-btn-primary" onClick={openAdd}>
          <Plus size={15} /> Nouvelle fonction
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div className="fp-alert">⚠ {error}<button onClick={() => setError(null)}>×</button></div>
      )}

      {/* Recherche */}
      <div className="fp-search-wrapper">
        <div className="fp-search-box">
          <Search className="fp-search-icon" size={14} />
          <input className="fp-search-input"
            placeholder="Rechercher par nom, agent, direction, N° fonction..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Tableau */}
      <div className="fp-table-wrapper">
        <table className="fp-table">
          <thead>
            <tr>
              {['Agent', 'N° Fonction', 'Nom de la fonction', 'Direction', 'Date fonction', 'Date affectation', 'Prime', 'Actions'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="fp-empty"><span className="fp-spinner" /> Chargement...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="fp-empty">Aucune fonction trouvée</td></tr>
            ) : filtered.map((f, i) => (
              <tr key={f.Id_fonction} className={`fp-row ${i % 2 === 0 ? 'fp-row-even' : 'fp-row-odd'}`}>
                <td>
                  {f.agent ? (
                    <>
                      <div className="fp-agent-name">{f.agent.civilite} {f.agent.nom}</div>
                      <div className="fp-agent-mat">{f.agent.num_matricule}</div>
                    </>
                  ) : <span className="fp-cell-gray">—</span>}
                </td>
                <td>
                  {f.num_fonct
                    ? <span className="fp-num-fonct">{f.num_fonct}</span>
                    : <span className="fp-cell-gray">—</span>}
                </td>
                <td>
                  <span className="fp-nom-fonction">{f.nom_fonction}</span>
                </td>
                <td>
                  {f.direction ? (
                    <span className="fp-direction-badge">{f.direction.sigle}</span>
                  ) : <span className="fp-cell-gray">—</span>}
                </td>
                <td className="fp-cell-date">{fmt(f.date_fonction)}</td>
                <td className="fp-cell-date">{fmt(f.date_affectation)}</td>
                <td>
                  {f.fonction_prime && Number(f.fonction_prime) > 0
                    ? <span className="fp-prime">{ar(f.fonction_prime)}</span>
                    : <span className="fp-cell-gray">—</span>
                  }
                </td>
                <td>
                  <div className="fp-actions">
                    <button className="fp-icon-btn" title="Voir" onClick={() => setViewFonction(f)}>
                      <Eye size={13} />
                    </button>
                    <button className="fp-icon-btn fp-icon-btn--edit" title="Modifier" onClick={() => openEdit(f)}>
                      <Pencil size={13} />
                    </button>
                    <button className="fp-icon-btn fp-icon-btn--delete" title="Supprimer" onClick={() => handleDelete(f.Id_fonction)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="fp-pagination">
            <span className="fp-pagination-info">Page {page} sur {lastPage} · {total} fonctions</span>
            <div className="fp-pagination-buttons">
              <button className="fp-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} title="Précédent">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: lastPage }, (_, i) => i + 1)
                .filter(p => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="fp-ellipsis">…</span>}
                    <button className={`fp-page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                  </React.Fragment>
                ))
              }
              <button className="fp-page-btn" onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage} title="Suivant">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal détail */}
      {viewFonction && (
        <div className="fp-modal-overlay">
          <div className="fp-modal">
            <div className="fp-modal-header">
              <div className="fp-modal-header-content">
                <div className="fp-modal-icon"><Briefcase size={20} /></div>
                <div>
                  <div className="fp-modal-title">{viewFonction.nom_fonction}</div>
                  <div className="fp-modal-sub">
                    {viewFonction.agent
                      ? `${viewFonction.agent.civilite} ${viewFonction.agent.nom} ${viewFonction.agent.prenoms} · ${viewFonction.agent.num_matricule}`
                      : '—'}
                  </div>
                </div>
              </div>
              <button className="fp-modal-close" onClick={() => setViewFonction(null)} title="Fermer">
                <X size={16} />
              </button>
            </div>

            <div className="fp-modal-body">
              <div className="fp-modal-grid">
                {[
                  { label: 'Nom de la fonction',  value: viewFonction.nom_fonction },
                  { label: 'N° fonction',          value: viewFonction.num_fonct || '—' },
                  { label: 'Direction',            value: viewFonction.direction ? `[${viewFonction.direction.sigle}] ${viewFonction.direction.nom_direction}` : '—' },
                  { label: 'Prime de fonction',    value: ar(viewFonction.fonction_prime) },
                  { label: 'Date de prise',        value: fmt(viewFonction.date_fonction) },
                  { label: 'Date d\'affectation',  value: fmt(viewFonction.date_affectation) },
                  { label: 'Agent',                value: viewFonction.agent ? `${viewFonction.agent.civilite} ${viewFonction.agent.nom} ${viewFonction.agent.prenoms}` : '—' },
                  { label: 'Matricule',            value: viewFonction.agent?.num_matricule || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="fp-modal-field">
                    <div className="fp-modal-field-label">{label}</div>
                    <div className="fp-modal-field-value">{value}</div>
                  </div>
                ))}
              </div>

              {/* Prime mise en avant si présente */}
              {viewFonction.fonction_prime && Number(viewFonction.fonction_prime) > 0 && (
                <div className="fp-modal-prime">
                  <span>Prime de fonction</span>
                  <span className="fp-modal-prime-amount">{ar(viewFonction.fonction_prime)}</span>
                </div>
              )}
            </div>

            <div className="fp-modal-footer">
              <button className="fp-btn-secondary" onClick={() => setViewFonction(null)}>Fermer</button>
              <button className="fp-btn-primary" onClick={() => { setViewFonction(null); openEdit(viewFonction) }}>
                <Pencil size={13} /> Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <FonctionForm
          fonction={editFonction}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditFonction(null) }}
        />
      )}
    </div>
  )
}