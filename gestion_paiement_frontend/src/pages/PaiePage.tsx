import React, { useState, useEffect } from 'react'
import { Plus, Eye, Pencil, Trash2, Search, FileText, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { getPaies, createPaie, updatePaie, deletePaie, type PaieFromAPI, type PaiePayload } from '../services/paieService'
import { PaieForm } from '../components/PaieForm'
import '../styles/pages/PaiePage.css'
import { exportPdf } from '../axios'

const MOIS = [
  'Jan','Fév','Mar','Avr','Mai','Juin',
  'Juil','Aoû','Sep','Oct','Nov','Déc',
]

const MODE_COLORS: Record<string, { bg: string; color: string }> = {
  Virement:  { bg: '#1a6b3c18', color: '#1a6b3c' },
  Espèces:   { bg: '#8c6d1a18', color: '#8c6d1a' },
  Chèque:    { bg: '#1a4d8c18', color: '#1a4d8c' },
}

export const PaiePage: React.FC = () => {
  const [paies, setPaies]         = useState<PaieFromAPI[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [showForm, setShowForm]   = useState(false)
  const [editPaie, setEditPaie]   = useState<PaieFromAPI | null>(null)
  const [viewPaie, setViewPaie]   = useState<PaieFromAPI | null>(null)
  const [page, setPage]           = useState(1)
  const [lastPage, setLastPage]   = useState(1)
  const [total, setTotal]         = useState(0)
  const [error, setError]         = useState<string | null>(null)

  // ── Chargement ────────────────────────────────────────────────────────────
  const loadPaies = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getPaies({ page, per_page: 15 })
      // Votre PaieResource::collection → Laravel wraps in { data: [...], meta: {...} } ou { data: [...] }
      const raw = res.data.data ?? res.data ?? []
      setPaies(raw)
      if (res.data.meta) {
        setLastPage(res.data.meta.last_page ?? 1)
        setTotal(res.data.meta.total ?? raw.length)
      }
    } catch (err: any) {
      setError('Impossible de charger les bulletins de paie')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPaies() }, [page])

  // ── Filtrage local ────────────────────────────────────────────────────────
  const filtered = paies.filter(p => {
    const q = search.toLowerCase()
    return (
      p.agent?.nom?.toLowerCase().includes(q) ||
      p.agent?.prenoms?.toLowerCase().includes(q) ||
      p.agent?.num_matricule?.toLowerCase().includes(q) ||
      String(p.mois).includes(q) ||
      String(p.annee).includes(q)
    )
  })

  // ── Sauvegarde ────────────────────────────────────────────────────────────
  const handleSave = async (data: PaiePayload) => {
    if (editPaie) {
      await updatePaie(editPaie.Id_paie, data)
      alert('Bulletin modifié avec succès')
    } else {
      await createPaie(data)
      alert('Bulletin créé avec succès')
    }
    loadPaies()
    setShowForm(false)
    setEditPaie(null)
  }

  // ── Suppression ───────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce bulletin de paie ?')) return
    try {
      await deletePaie(id)
      alert('Bulletin supprimé')
      loadPaies()
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Erreur lors de la suppression')
    }
  }

  const openEdit = (p: PaieFromAPI) => { setEditPaie(p); setShowForm(true) }
  const openAdd  = () => { setEditPaie(null); setShowForm(true) }

  return (
    <div className="pp-page">

      {/* Header */}
      <div className="pp-header">
        <div>
          <h1 className="pp-title">Bulletins de Paie</h1>
          <p className="pp-subtitle">{total} bulletin{total > 1 ? 's' : ''} enregistré{total > 1 ? 's' : ''}</p>
        </div>
        <div className="ap-header-actions">
          <button className="ap-btn-secondary">
            <Download size={14} /> Exporter
          </button>
          <button className="pp-btn-primary" onClick={openAdd}>
            <Plus size={15} /> Nouveau bulletin
          </button>
        </div>

      </div>

      {/* Erreur */}
      {error && (
        <div className="pp-alert">
          ⚠ {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Recherche */}
      <div className="pp-search-wrapper">
        <div className="pp-search-box">
          <Search className="pp-search-icon" size={14} />
          <input
            type="text"
            className="pp-search-input"
            placeholder="Rechercher par agent, mois, année..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tableau */}
      <div className="pp-table-wrapper">
        <table className="pp-table">
          <thead>
            <tr>
              {['#', 'Agent', 'Période', 'Salaire brut', 'IGR', 'PA', 'Net à payer', 'Mode', 'Actions'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="pp-empty"><span className="pp-spinner" /> Chargement...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} className="pp-empty">Aucun bulletin trouvé</td></tr>
            ) : filtered.map((p, i) => {
              const net = 
                      ((p.salaire_brut ?? 0) +
                      (p.prime ?? 0) +
                      (p.prime_speciale ?? 0) +
                      (p.prime_fin_annee ?? 0) +
                      (p.alloc ?? 0) +
                      (p.logement ?? 0) +
                      (p.scola ?? 0) +
                      (p.remboursement ?? 0) +
                      (p.rappel ?? 0))
                      -
                      ((p.IGR ?? 0) + (p.PA ?? 0))
              const modeColor = MODE_COLORS[p.mode_paie] ?? { bg: '#f0f0f0', color: '#666' }
              return (
                <tr key={p.Id_paie} className={`pp-row ${i % 2 === 0 ? 'pp-row-even' : 'pp-row-odd'}`}>
                  <td><span className="pp-id">#{p.Id_paie}</span></td>
                  <td>
                    {p.agent ? (
                      <>
                        <div className="pp-agent-name">{p.agent.civilite} {p.agent.nom}</div>
                        <div className="pp-agent-mat">{p.agent.num_matricule}</div>
                      </>
                    ) : <span className="pp-cell-gray">—</span>}
                  </td>
                  <td>
                    <span className="pp-periode">{MOIS[p.mois - 1]} {p.annee}</span>
                  </td>
                  <td className="pp-cell-num">{(p.salaire_brut ?? 0).toLocaleString('fr-MG')} Ar</td>
                  <td className="pp-cell-red">- {(p.IGR ?? 0).toLocaleString('fr-MG')} Ar</td>
                  <td className="pp-cell-red">- {(p.PA ?? 0).toLocaleString('fr-MG')} Ar</td>
                  <td>
                    <span className="pp-net">{net.toLocaleString('fr-MG')} Ar</span>
                  </td>
                  <td>
                    <span className="pp-mode" style={{ background: modeColor.bg, color: modeColor.color }}>
                      {p.mode_paie}
                    </span>
                  </td>
                  <td>
                    <div className="pp-actions">
                      <button className="pp-icon-btn" title="Voir" onClick={() => setViewPaie(p)}>
                        <Eye size={13} />
                      </button>
                      <button className="pp-icon-btn pp-icon-btn--edit" title="Modifier" onClick={() => openEdit(p)}>
                        <Pencil size={13} />
                      </button>
                      <button className="pp-icon-btn pp-icon-btn--delete" title="Supprimer" onClick={() => handleDelete(p.Id_paie)}>
                        <Trash2 size={13} />
                      </button>
                      <button className="ap-btn-secondary" title="Exporter ce bulletin" onClick={() => exportPdf(p.Id_paie)}>
                        <Download size={14} />
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
          <div className="pp-pagination">
            <span className="pp-pagination-info">Page {page} sur {lastPage} · {total} bulletins</span>
            <div className="pp-pagination-buttons">
              <button className="pp-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} title="Précédent">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: lastPage }, (_, i) => i + 1)
                .filter(p => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="pp-ellipsis">…</span>}
                    <button
                      className={`pp-page-btn ${p === page ? 'active' : ''}`}
                      onClick={() => setPage(p)}
                    >{p}</button>
                  </React.Fragment>
                ))
              }
              <button className="pp-page-btn" onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage} title="Suivant">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal détail bulletin */}
      {viewPaie && (
        <div className="pp-modal-overlay">
          <div className="pp-modal">
            <div className="pp-modal-header">
              <div className="pp-modal-header-content">
                <div className="pp-modal-icon"><FileText size={22} /></div>
                <div>
                  <div className="pp-modal-title">
                    Bulletin #{viewPaie.Id_paie} — {MOIS[viewPaie.mois - 1]} {viewPaie.annee}
                  </div>
                  <div className="pp-modal-sub">
                    {viewPaie.agent
                      ? `${viewPaie.agent.civilite} ${viewPaie.agent.nom} ${viewPaie.agent.prenoms} · ${viewPaie.agent.num_matricule}`
                      : '—'}
                  </div>
                </div>
              </div>
              <button className="pp-modal-close" onClick={() => setViewPaie(null)} title="Fermer">×</button>
            </div>

            <div className="pp-modal-body">
              {/* Rémunérations */}
              <p className="pp-modal-section-title">Rémunérations</p>
              <div className="pp-modal-grid">
                {[
                  { label: 'Salaire brut',     value: viewPaie.salaire_brut },
                  { label: 'Indice',            value: viewPaie.Indice },
                  { label: 'Prime',             value: viewPaie.prime },
                  { label: 'Prime spéciale',    value: viewPaie.prime_speciale },
                  { label: 'Prime fin d\'année',value: viewPaie.prime_fin_annee },
                  { label: 'Allocation',        value: viewPaie.alloc },
                  { label: 'Logement',          value: viewPaie.logement },
                  { label: 'Scolarité',         value: viewPaie.scola },
                  { label: 'Remboursement',     value: viewPaie.remboursement },
                  { label: 'Rappel',            value: viewPaie.rappel },
                ].map(({ label, value }) => (
                  <div key={label} className="pp-modal-field">
                    <div className="pp-modal-field-label">{label}</div>
                    <div className="pp-modal-field-value">{value?.toLocaleString('fr-MG') ?? 0} Ar</div>
                  </div>
                ))}
              </div>

              {/* Déductions */}
              <p className="pp-modal-section-title" style={{ marginTop: 16 }}>Déductions</p>
              <div className="pp-modal-grid">
                <div className="pp-modal-field">
                  <div className="pp-modal-field-label">IGR</div>
                  <div className="pp-modal-field-value red">- {viewPaie.IGR?.toLocaleString('fr-MG') ?? 0} Ar</div>
                </div>
                <div className="pp-modal-field">
                  <div className="pp-modal-field-label">PA / CNAPS</div>
                  <div className="pp-modal-field-value red">- {viewPaie.PA?.toLocaleString('fr-MG') ?? 0} Ar</div>
                </div>
              </div>

              {/* Net */}
              <div className="pp-modal-net">
                <span>Net à payer</span>
                <span className="pp-modal-net-amount">
                  {(
                    (viewPaie.salaire_brut + viewPaie.prime + viewPaie.prime_speciale +
                     viewPaie.prime_fin_annee + viewPaie.alloc + viewPaie.logement +
                     viewPaie.scola + viewPaie.remboursement + viewPaie.rappel)
                    - (viewPaie.IGR + viewPaie.PA)
                  ).toLocaleString('fr-MG')} Ar
                </span>
              </div>

              {/* Infos complémentaires */}
              <p className="pp-modal-section-title" style={{ marginTop: 16 }}>Informations</p>
              <div className="pp-modal-grid">
                {[
                  { label: 'Mode de paie', value: viewPaie.mode_paie },
                  { label: 'Date d\'effet', value: viewPaie.date_effet || '—' },
                  { label: 'Chapitre',     value: viewPaie.chap || '—' },
                  { label: 'Article',      value: viewPaie.art || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="pp-modal-field">
                    <div className="pp-modal-field-label">{label}</div>
                    <div className="pp-modal-field-value">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pp-modal-footer">
              <button className="pp-btn-secondary" onClick={() => setViewPaie(null)}>Fermer</button>
              <button className="pp-btn-primary" onClick={() => { setViewPaie(null); openEdit(viewPaie) }}>
                <Pencil size={13} /> Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <PaieForm
          paie={editPaie}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditPaie(null) }}
        />
      )}
    </div>
  )
}