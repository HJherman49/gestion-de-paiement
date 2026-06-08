import React, { useState, useEffect } from 'react'
import {
  Plus, Eye, Pencil, Trash2, Search,
  ChevronLeft, ChevronRight, X, BarChart2,
} from 'lucide-react'
import {
  getBaremes, createBareme, updateBareme, deleteBareme,
  type BaremeFromAPI, type BaremePayload,
} from '../services/baremeService'
import { BaremeForm } from '../components/BaremeForm'
import '../styles/pages/BaremePage.css'

const ar = (val: any) => `${Number(val ?? 0).toLocaleString('fr-MG')} Ar`

export const BaremePage: React.FC = () => {
  const [baremes, setBaremes]       = useState<BaremeFromAPI[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [showForm, setShowForm]     = useState(false)
  const [editBareme, setEditBareme] = useState<BaremeFromAPI | null>(null)
  const [viewBareme, setViewBareme] = useState<BaremeFromAPI | null>(null)
  const [page, setPage]             = useState(1)
  const [lastPage, setLastPage]     = useState(1)
  const [total, setTotal]           = useState(0)
  const [error, setError]           = useState<string | null>(null)
  const [sortBy, setSortBy]         = useState<'Indice' | 'salaire_base'>('Indice')

  // ── Chargement 
  const load = async () => {
    setLoading(true); setError(null)
    try {
      const res = await getBaremes({ page, per_page: 20 })
      const raw = res.data.data ?? res.data ?? []
      setBaremes(raw)
      if (res.data.meta) {
        setLastPage(res.data.meta.last_page ?? 1)
        setTotal(res.data.meta.total ?? raw.length)
      }
    } catch { setError('Impossible de charger les barèmes') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page])

  // ── Filtrage + tri 
  const filtered = baremes
    .filter(b => {
      const q = search.toLowerCase()
      return (
        String(b.Indice).includes(q) ||
        String(b.salaire_base).includes(q) ||
        String(b.salaire_mensuel).includes(q)
      )
    })
    .sort((a, b) => sortBy === 'Indice'
      ? a.Indice - b.Indice
      : Number(b.salaire_base) - Number(a.salaire_base)
    )

  // ── Stats 
  const maxSalaire = baremes.length
    ? Math.max(...baremes.map(b => Number(b.salaire_base)))
    : 0
  const minSalaire = baremes.length
    ? Math.min(...baremes.map(b => Number(b.salaire_base)))
    : 0
  const avgSalaire = baremes.length
    ? baremes.reduce((s, b) => s + Number(b.salaire_base), 0) / baremes.length
    : 0

  // ── Sauvegarde
  const handleSave = async (data: BaremePayload) => {
    if (editBareme) { await updateBareme(editBareme.Id_bareme, data); alert('Barème modifié') }
    else            { await createBareme(data); alert('Barème créé') }
    load(); setShowForm(false); setEditBareme(null)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce barème ?')) return
    try {
      await deleteBareme(id); alert('Barème supprimé'); load()
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur lors de la suppression')
    }
  }

  const openEdit = (b: BaremeFromAPI) => { setEditBareme(b); setShowForm(true) }
  const openAdd  = () => { setEditBareme(null); setShowForm(true) }

  return (
    <div className="brp-page">

      {/* Header */}
      <div className="brp-header">
        <div>
          <h1 className="brp-title">Barèmes salariaux</h1>
          <p className="brp-subtitle">{total} barème{total > 1 ? 's' : ''} enregistré{total > 1 ? 's' : ''}</p>
        </div>
        <button className="brp-btn-primary" onClick={openAdd}>
          <Plus size={15} /> Nouveau barème
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div className="brp-alert">⚠ {error}<button onClick={() => setError(null)}>×</button></div>
      )}

      {/* Stats */}
      {baremes.length > 0 && (
        <div className="brp-stats">
          {[
            { label: 'Indice minimum',   value: Math.min(...baremes.map(b => b.Indice)), suffix: '' },
            { label: 'Indice maximum',   value: Math.max(...baremes.map(b => b.Indice)), suffix: '' },
            { label: 'Salaire minimum',  value: minSalaire, suffix: ' Ar', money: true },
            { label: 'Salaire maximum',  value: maxSalaire, suffix: ' Ar', money: true },
            { label: 'Salaire moyen',    value: avgSalaire, suffix: ' Ar', money: true },
          ].map(({ label, value, suffix, money }) => (
            <div key={label} className="brp-stat-card">
              <span className="brp-stat-label">{label}</span>
              <span className="brp-stat-value">
                {money ? Number(value).toLocaleString('fr-MG') : value}{suffix}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Filtres */}
      <div className="brp-toolbar">
        <div className="brp-search-box">
          <Search className="brp-search-icon" size={14} />
          <input className="brp-search-input"
            placeholder="Rechercher par indice, salaire..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="brp-sort">
          <span className="brp-sort-label">Trier par :</span>
          <button
            className={`brp-sort-btn ${sortBy === 'Indice' ? 'active' : ''}`}
            onClick={() => setSortBy('Indice')}
          >Indice</button>
          <button
            className={`brp-sort-btn ${sortBy === 'salaire_base' ? 'active' : ''}`}
            onClick={() => setSortBy('salaire_base')}
          >Salaire</button>
        </div>
      </div>

      {/* Tableau */}
      <div className="brp-table-wrapper">
        <table className="brp-table">
          <thead>
            <tr>
              {['Indice', 'Salaire de base', 'Salaire mensuel', 'Ancienneté', 'DIF', 'Rappel', 'Actions'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="brp-empty"><span className="brp-spinner" /> Chargement...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="brp-empty">Aucun barème trouvé</td></tr>
            ) : filtered.map((b, i) => {
              // Barre de progression relative au max
              const pct = maxSalaire > 0 ? (Number(b.salaire_base) / maxSalaire) * 100 : 0
              return (
                <tr key={b.Id_bareme} className={`brp-row ${i % 2 === 0 ? 'brp-row-even' : 'brp-row-odd'}`}>
                  <td>
                    <div className="brp-indice-wrapper">
                      <span className="brp-indice">{b.Indice}</span>
                      <div className="brp-indice-bar">
                        <div className="brp-indice-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </td>
                  <td><span className="brp-salaire-base">{ar(b.salaire_base)}</span></td>
                  <td className="brp-cell-num">{ar(b.salaire_mensuel)}</td>
                  <td className="brp-cell-num">{ar(b.anciennete)}</td>
                  <td className="brp-cell-num">{ar(b.DIF)}</td>
                  <td className="brp-cell-num">{ar(b.rappell)}</td>
                  <td>
                    <div className="brp-actions">
                      <button className="brp-icon-btn" title="Voir" onClick={() => setViewBareme(b)}>
                        <Eye size={13} />
                      </button>
                      <button className="brp-icon-btn brp-icon-btn--edit" title="Modifier" onClick={() => openEdit(b)}>
                        <Pencil size={13} />
                      </button>
                      <button className="brp-icon-btn brp-icon-btn--delete" title="Supprimer" onClick={() => handleDelete(b.Id_bareme)}>
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
          <div className="brp-pagination">
            <span className="brp-pagination-info">Page {page} sur {lastPage} · {total} barèmes</span>
            <div className="brp-pagination-buttons">
              <button className="brp-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} title="Précédent">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: lastPage }, (_, i) => i + 1)
                .filter(p => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="brp-ellipsis">…</span>}
                    <button className={`brp-page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                  </React.Fragment>
                ))
              }
              <button className="brp-page-btn" onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage} title="Suivant">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal détail */}
      {viewBareme && (
        <div className="brp-modal-overlay">
          <div className="brp-modal">
            <div className="brp-modal-header">
              <div className="brp-modal-header-content">
                <div className="brp-modal-icon"><BarChart2 size={20} /></div>
                <div>
                  <div className="brp-modal-title">Barème — Indice {viewBareme.Indice}</div>
                  <div className="brp-modal-sub">#{viewBareme.Id_bareme}</div>
                </div>
              </div>
              <button className="brp-modal-close" onClick={() => setViewBareme(null)} title="Fermer">
                <X size={16} />
              </button>
            </div>

            <div className="brp-modal-body">
              {/* Indice en grand */}
              <div className="brp-modal-indice-block">
                <span className="brp-modal-indice-label">Indice</span>
                <span className="brp-modal-indice-value">{viewBareme.Indice}</span>
              </div>

              {/* Détails */}
              <div className="brp-modal-grid">
                {[
                  { label: 'Salaire de base',  value: ar(viewBareme.salaire_base),    highlight: true },
                  { label: 'Salaire mensuel',  value: ar(viewBareme.salaire_mensuel), highlight: false },
                  { label: 'Ancienneté',        value: ar(viewBareme.anciennete),      highlight: false },
                  { label: 'DIF',               value: ar(viewBareme.DIF),             highlight: false },
                  { label: 'Rappel',            value: ar(viewBareme.rappell),         highlight: false },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className={`brp-modal-field ${highlight ? 'brp-modal-field--highlight' : ''}`}>
                    <div className="brp-modal-field-label">{label}</div>
                    <div className={`brp-modal-field-value ${highlight ? 'brp-modal-field-value--big' : ''}`}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="brp-modal-total">
                <span>Total (base + ancienneté + DIF + rappel)</span>
                <span className="brp-modal-total-amount">
                  {(Number(viewBareme.salaire_base) + Number(viewBareme.anciennete) + Number(viewBareme.DIF) + Number(viewBareme.rappell)).toLocaleString('fr-MG')} Ar
                </span>
              </div>
            </div>

            <div className="brp-modal-footer">
              <button className="brp-btn-secondary" onClick={() => setViewBareme(null)}>Fermer</button>
              <button className="brp-btn-primary" onClick={() => { setViewBareme(null); openEdit(viewBareme) }}>
                <Pencil size={13} /> Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <BaremeForm
          bareme={editBareme}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditBareme(null) }}
        />
      )}
    </div>
  )
}