import React, { useState, useEffect } from 'react'
import {
  Plus, Eye, Pencil, Trash2, Search,
  ChevronLeft, ChevronRight, TrendingUp, X,
} from 'lucide-react'
import {
  getCarrieres, createCarriere, updateCarriere, deleteCarriere,
  type CarriereFromAPI, type CarrierePayload,
} from '../services/carriereService'
import { CarriereForm } from '../components/CarriereForm'
import '../styles/pages/CarrierePage.css'

const CATEGORIE_COLORS: Record<string, { bg: string; color: string }> = {
  A1: { bg: '#1a1f3c18', color: '#1a1f3c' },
  A2: { bg: '#1a4d8c18', color: '#1a4d8c' },
  B1: { bg: '#27ae6018', color: '#27ae60' },
  B2: { bg: '#1a6b3c18', color: '#1a6b3c' },
  C1: { bg: '#8c6d1a18', color: '#8c6d1a' },
  C2: { bg: '#f39c1218', color: '#d68910' },
  D:  { bg: '#c0392b18', color: '#c0392b' },
}

export const CarrierePage: React.FC = () => {
  const [carrieres, setCarrieres]   = useState<CarriereFromAPI[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [showForm, setShowForm]     = useState(false)
  const [editCarriere, setEditCarriere] = useState<CarriereFromAPI | null>(null)
  const [viewCarriere, setViewCarriere] = useState<CarriereFromAPI | null>(null)
  const [page, setPage]             = useState(1)
  const [lastPage, setLastPage]     = useState(1)
  const [total, setTotal]           = useState(0)
  const [error, setError]           = useState<string | null>(null)

  // ── Chargement 
  const loadCarrieres = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getCarrieres({ page, per_page: 15 })
      const raw = res.data.data ?? res.data ?? []
      setCarrieres(raw)
      if (res.data.meta) {
        setLastPage(res.data.meta.last_page ?? 1)
        setTotal(res.data.meta.total ?? raw.length)
      }
    } catch {
      setError('Impossible de charger les carrières')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCarrieres() }, [page])

  // ── Filtrage local 
  const filtered = carrieres.filter(c => {
    const q = search.toLowerCase()
    return (
      c.agent?.nom?.toLowerCase().includes(q) ||
      c.agent?.prenoms?.toLowerCase().includes(q) ||
      c.agent?.num_matricule?.toLowerCase().includes(q) ||
      c.grade?.toLowerCase().includes(q) ||
      c.corps?.toLowerCase().includes(q) ||
      c.Categorie?.toLowerCase().includes(q)
    )
  })

  // ── Sauvegarde 
  const handleSave = async (data: CarrierePayload) => {
    try {
      if (editCarriere) {
        await updateCarriere(editCarriere.Id_carriere, data)
        alert('Carrière modifiée avec succès')
      } else {
        await createCarriere(data)
        alert('Carrière créée avec succès')
      }
      loadCarrieres()
      setShowForm(false)
      setEditCarriere(null)
    } catch (err: any) {
      const v = err.response?.data?.errors
      if (v) {
        const msg = Object.values(v).flat().join('\n')
        alert('Erreurs :\n' + msg)
      } else {
        alert(err.response?.data?.message ?? 'Erreur lors de la sauvegarde')
      }
      throw err
    }
  }

  // ── Suppression 
  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette carrière ?')) return
    try {
      await deleteCarriere(id)
      alert('Carrière supprimée')
      loadCarrieres()
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur lors de la suppression')
    }
  }

  const openEdit = (c: CarriereFromAPI) => { setEditCarriere(c); setShowForm(true) }
  const openAdd  = () => { setEditCarriere(null); setShowForm(true) }

  return (
    <div className="cr-page">

      {/* Header */}
      <div className="cr-header">
        <div>
          <h1 className="cr-title">Gestion des Carrières</h1>
          <p className="cr-subtitle">
            {total} carrière{total > 1 ? 's' : ''} enregistrée{total > 1 ? 's' : ''}
          </p>
        </div>
        <button className="cr-btn-primary" onClick={openAdd}>
          <Plus size={15} /> Nouvelle carrière
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div className="cr-alert">
          ⚠ {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Stats rapides */}
      <div className="cr-stats">
        {Object.entries(CATEGORIE_COLORS).map(([cat, colors]) => {
          const count = carrieres.filter(c => c.Categorie === cat).length
          return (
            <div key={cat} className="cr-stat-card" style={{ borderLeftColor: colors.color }}>
              <span className="cr-stat-badge" style={{ background: colors.bg, color: colors.color }}>
                {cat}
              </span>
              <span className="cr-stat-count">{count}</span>
              <span className="cr-stat-label">agent{count > 1 ? 's' : ''}</span>
            </div>
          )
        })}
      </div>

      {/* Recherche */}
      <div className="cr-search-wrapper">
        <div className="cr-search-box">
          <Search className="cr-search-icon" size={14} />
          <input
            type="text"
            className="cr-search-input"
            placeholder="Rechercher par agent, grade, corps, catégorie..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tableau */}
      <div className="cr-table-wrapper">
        <table className="cr-table">
          <thead>
            <tr>
              {['Agent', 'Catégorie', 'Corps', 'Grade', 'Classe', 'Échelon', 'Indice', 'Barème', 'Actions'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="cr-empty"><span className="cr-spinner" /> Chargement...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} className="cr-empty">Aucune carrière trouvée</td></tr>
            ) : filtered.map((c, i) => {
              const catColor = CATEGORIE_COLORS[c.Categorie] ?? { bg: '#f0f0f0', color: '#666' }
              return (
                <tr key={c.Id_carriere} className={`cr-row ${i % 2 === 0 ? 'cr-row-even' : 'cr-row-odd'}`}>
                  <td>
                    {c.agent ? (
                      <>
                        <div className="cr-agent-name">{c.agent.civilite} {c.agent.nom}</div>
                        <div className="cr-agent-info">
                          {c.agent.num_matricule}
                          {c.agent.direction && <span> · {c.agent.direction.Sigle}</span>}
                        </div>
                      </>
                    ) : <span className="cr-cell-gray">—</span>}
                  </td>
                  <td>
                    <span className="cr-badge" style={{ background: catColor.bg, color: catColor.color }}>
                      {c.Categorie || '—'}
                    </span>
                  </td>
                  <td className="cr-cell-gray">{c.corps || '—'}</td>
                  <td>
                    <span className="cr-grade">{c.grade || '—'}</span>
                  </td>
                  <td className="cr-cell-gray">{c.classe || '—'}</td>
                  <td>
                    {c.echelon
                      ? <span className="cr-echelon">{c.echelon}ème</span>
                      : <span className="cr-cell-gray">—</span>
                    }
                  </td>
                  <td>
                    {c.indice
                      ? <span className="cr-indice">{c.indice}</span>
                      : <span className="cr-cell-gray">—</span>
                    }
                  </td>
                  <td className="cr-cell-gray">
                    {c.bareme
                      ? `${Number(c.bareme.salaire_mensuel).toLocaleString('fr-MG')} Ar`
                      : '—'
                    }
                  </td>
                  <td>
                    <div className="cr-actions">
                      <button className="cr-icon-btn" title="Voir" onClick={() => setViewCarriere(c)}>
                        <Eye size={13} />
                      </button>
                      <button className="cr-icon-btn cr-icon-btn--edit" title="Modifier" onClick={() => openEdit(c)}>
                        <Pencil size={13} />
                      </button>
                      <button className="cr-icon-btn cr-icon-btn--delete" title="Supprimer" onClick={() => handleDelete(c.Id_carriere)}>
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
          <div className="cr-pagination">
            <span className="cr-pagination-info">Page {page} sur {lastPage} · {total} carrières</span>
            <div className="cr-pagination-buttons">
              <button className="cr-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} title="Précédent">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: lastPage }, (_, i) => i + 1)
                .filter(p => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="cr-ellipsis">…</span>}
                    <button className={`cr-page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                  </React.Fragment>
                ))
              }
              <button className="cr-page-btn" onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage} title="Suivant">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal détail */}
      {viewCarriere && (
        <div className="cr-modal-overlay">
          <div className="cr-modal">
            <div className="cr-modal-header">
              <div className="cr-modal-header-content">
                <div className="cr-modal-icon"><TrendingUp size={22} /></div>
                <div>
                  <div className="cr-modal-title">
                    {viewCarriere.grade || 'Carrière'} — Cat. {viewCarriere.Categorie}
                  </div>
                  <div className="cr-modal-sub">
                    {viewCarriere.agent
                      ? `${viewCarriere.agent.civilite} ${viewCarriere.agent.nom} ${viewCarriere.agent.prenoms} · ${viewCarriere.agent.num_matricule}`
                      : '—'}
                  </div>
                </div>
              </div>
              <button className="cr-modal-close" onClick={() => setViewCarriere(null)} title="Fermer">
                <X size={16} />
              </button>
            </div>

            <div className="cr-modal-body">
              <p className="cr-modal-section-title">Classification</p>
              <div className="cr-modal-grid">
                {[
                  { label: 'Catégorie', value: viewCarriere.Categorie },
                  { label: 'Corps',     value: viewCarriere.corps },
                  { label: 'Grade',     value: viewCarriere.grade },
                  { label: 'Classe',    value: viewCarriere.classe },
                  { label: 'Échelon',   value: viewCarriere.echelon ? `${viewCarriere.echelon}ème échelon` : null },
                  { label: 'Indice',    value: viewCarriere.indice },
                ].map(({ label, value }) => (
                  <div key={label} className="cr-modal-field">
                    <div className="cr-modal-field-label">{label}</div>
                    <div className="cr-modal-field-value">{value ?? '—'}</div>
                  </div>
                ))}
              </div>

              {viewCarriere.bareme && (
                <>
                  <p className="cr-modal-section-title" style={{ marginTop: 20 }}>Barème salarial</p>
                  <div className="cr-modal-bareme">
                    <div className="cr-modal-field">
                      <div className="cr-modal-field-label">Indice barème</div>
                      <div className="cr-modal-field-value">{viewCarriere.bareme.indice}</div>
                    </div>
                    <div className="cr-modal-field">
                      <div className="cr-modal-field-label">Salaire mensuel</div>
                      <div className="cr-modal-field-value cr-modal-field-value--green">
                        {Number(viewCarriere.bareme.salaire_mensuel).toLocaleString('fr-MG')} Ar
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="cr-modal-footer">
              <button className="cr-btn-secondary" onClick={() => setViewCarriere(null)}>Fermer</button>
              <button className="cr-btn-primary" onClick={() => { setViewCarriere(null); openEdit(viewCarriere) }}>
                <Pencil size={13} /> Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <CarriereForm
          carriere={editCarriere}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditCarriere(null) }}
        />
      )}
    </div>
  )
}