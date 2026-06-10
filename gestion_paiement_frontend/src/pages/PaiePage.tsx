import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Plus, Eye, Pencil, Trash2, Search, FileText, Download, History, ChevronDown } from 'lucide-react'
import { getPaies, createPaie, updatePaie, deletePaie, type PaieFromAPI, type PaiePayload } from '../services/paieService'
import { PaieForm } from '../components/PaieForm'
import '../styles/pages/PaiePage.css'
import { exportPdf } from '../axios'

const MOIS_COURTS = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc']
const MOIS_LONGS  = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

const MODE_COLORS: Record<string, { bg: string; color: string }> = {
  Virement: { bg: '#1a6b3c18', color: '#1a6b3c' },
  Espèces:  { bg: '#8c6d1a18', color: '#8c6d1a' },
  Chèque:   { bg: '#1a4d8c18', color: '#1a4d8c' },
}

interface PaieGroup {
  key: string
  label: string
  mois?: number
  annee?: number
  paies: PaieFromAPI[]
}

export const PaiePage: React.FC = () => {
  const [paies, setPaies]       = useState<PaieFromAPI[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editPaie, setEditPaie] = useState<PaieFromAPI | null>(null)
  const [viewPaie, setViewPaie] = useState<PaieFromAPI | null>(null)
  const [page, setPage]         = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal]       = useState(0)
  const [error, setError]       = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('all')

  // ── Historique dropdown ──────────────────────────────────────────────────
  const [showHistorique, setShowHistorique] = useState(false)
  const [histAnnee, setHistAnnee]           = useState<number | null>(null)
  const historiqueRef = useRef<HTMLDivElement>(null)

  // ── Mois sélectionné dans "Tous les bulletins" ──────────────────────────
  const currentYear = new Date().getFullYear()
  const [filterMois, setFilterMois] = useState<number | null>(null)

  // Fermer dropdown si clic dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (historiqueRef.current && !historiqueRef.current.contains(e.target as Node)) {
        setShowHistorique(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const loadPaies = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getPaies({ page, per_page: 15 })
      const raw = res.data?.data ?? res.data ?? []
      setPaies(raw)
      if (res.data?.meta) {
        setLastPage(res.data.meta.last_page ?? 1)
        setTotal(res.data.meta.total ?? raw.length)
      }
    } catch {
      setError('Impossible de charger les bulletins de paie')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPaies() }, [page])

  // ── Groupement par mois/année ────────────────────────────────────────────
  const groupedPaies = useMemo<PaieGroup[]>(() => {
    let result = [...paies]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.agent?.nom?.toLowerCase().includes(q) ||
        p.agent?.prenoms?.toLowerCase().includes(q) ||
        p.agent?.num_matricule?.toLowerCase().includes(q)
      )
    }

    const groups: Record<string, PaieGroup> = {}
    result.forEach(paie => {
      const key   = `${paie.annee}-${String(paie.mois).padStart(2, '0')}`
      const label = `${MOIS_COURTS[paie.mois - 1]} ${paie.annee}`
      if (!groups[key]) groups[key] = { key, label, mois: paie.mois, annee: paie.annee, paies: [] }
      groups[key].paies.push(paie)
    })

    const allGroup: PaieGroup = { key: 'all', label: 'Tous les bulletins', paies: result }
    return [allGroup]
  }, [paies, search])

  // ── Années disponibles pour l'historique ────────────────────────────────
  const anneesDisponibles = useMemo(() => {
    const set = new Set(paies.map(p => p.annee))
    return Array.from(set).sort((a, b) => b - a)
  }, [paies])

  // ── Données affichées selon onglet + filtre mois ─────────────────────────
  const currentGroup = groupedPaies.find(g => g.key === activeTab) ?? groupedPaies[0]
  const displayedPaies = useMemo(() => {
    if (activeTab === 'all' && filterMois !== null) {
      return currentGroup.paies.filter(p => p.mois === filterMois)
    }
    return currentGroup.paies
  }, [currentGroup, activeTab, filterMois])

  const calculateNet = (p: PaieFromAPI): number => {
    const brut = (p.salaire_brut ?? 0) + (p.prime ?? 0) + (p.prime_speciale ?? 0) +
                 (p.prime_fin_annee ?? 0) + (p.alloc ?? 0) + (p.logement ?? 0) +
                 (p.scola ?? 0) + (p.remboursement ?? 0) + (p.rappel ?? 0)
    return brut - (p.IGR ?? 0) - (p.PA ?? 0)
  }

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

  // Naviguer vers un mois précis depuis l'historique
  const goToHistorique = (annee: number, mois: number) => {
    const key = `${annee}-${String(mois).padStart(2, '0')}`
    const exists = groupedPaies.find(g => g.key === key)
    if (exists) {
      setActiveTab(key)
    } else {
      setActiveTab('all')
      setFilterMois(mois)
    }
    setShowHistorique(false)
    setHistAnnee(null)
  }

  return (
    <div className="pp-page">

      {/* ── Header ── */}
      <div className="pp-header">
        <div>
          <h1 className="pp-title">Bulletins de Paie</h1>
          <p className="pp-subtitle">{total} bulletin{total > 1 ? 's' : ''} enregistré{total > 1 ? 's' : ''}</p>
        </div>
        <div className="ap-header-actions">

          {/* Bouton Historique */}
          <div ref={historiqueRef} style={{ position: 'relative' }}>
            <button
              className="ap-btn-secondary"
              onClick={() => setShowHistorique(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <History size={14} /> Historique <ChevronDown size={12} style={{ opacity: 0.6, transform: showHistorique ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {/* Dropdown historique */}
            {showHistorique && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                background: '#fff', border: '1px solid #e2e6ef',
                borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                zIndex: 999, width: '280px', overflow: 'hidden',
              }}>
                {/* Header dropdown */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f2f7', background: '#f8f9fc' }}>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#1a1f3c' }}>📅 Historique des paies</p>
                  <p style={{ fontSize: '11px', color: '#9aa3b5', marginTop: '2px' }}>Sélectionner une année puis un mois</p>
                </div>

                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {anneesDisponibles.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#9aa3b5', fontSize: '13px' }}>Aucun historique disponible</div>
                  ) : anneesDisponibles.map(annee => (
                    <div key={annee}>
                      {/* Ligne année */}
                      <button
                        onClick={() => setHistAnnee(histAnnee === annee ? null : annee)}
                        style={{
                          width: '100%', padding: '10px 16px',
                          background: histAnnee === annee ? '#1a1f3c' : '#fff',
                          border: 'none', cursor: 'pointer',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          borderBottom: '1px solid #f0f2f7',
                          fontFamily: 'DM Sans, sans-serif',
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: 700, color: histAnnee === annee ? '#fff' : '#1a1f3c' }}>
                          {annee}
                        </span>
                        <span style={{ fontSize: '11px', color: histAnnee === annee ? 'rgba(255,255,255,0.6)' : '#9aa3b5' }}>
                          {paies.filter(p => p.annee === annee).length} bulletins
                          <ChevronDown size={12} style={{ marginLeft: '4px', transform: histAnnee === annee ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </span>
                      </button>

                      {/* Grille mois */}
                      {histAnnee === annee && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', padding: '10px 12px', background: '#f8f9fc', borderBottom: '1px solid #f0f2f7' }}>
                          {MOIS_COURTS.map((m, idx) => {
                            const moisNum = idx + 1
                            const hasPaies = paies.some(p => p.annee === annee && p.mois === moisNum)
                            const count = paies.filter(p => p.annee === annee && p.mois === moisNum).length
                            return (
                              <button
                                key={m}
                                onClick={() => hasPaies && goToHistorique(annee, moisNum)}
                                disabled={!hasPaies}
                                style={{
                                  padding: '6px 4px', borderRadius: '6px',
                                  border: '1px solid',
                                  borderColor: hasPaies ? '#1a1f3c' : '#e2e6ef',
                                  background: hasPaies ? '#1a1f3c' : '#f0f2f7',
                                  color: hasPaies ? '#fff' : '#c5ccd9',
                                  fontSize: '11px', fontWeight: hasPaies ? 600 : 400,
                                  cursor: hasPaies ? 'pointer' : 'not-allowed',
                                  fontFamily: 'DM Sans, sans-serif',
                                  textAlign: 'center', position: 'relative',
                                }}
                                title={hasPaies ? `${MOIS_LONGS[idx]} ${annee} — ${count} bulletin(s)` : 'Aucun bulletin'}
                              >
                                {m}
                                {hasPaies && count > 0 && (
                                  <span style={{ display: 'block', fontSize: '9px', color: 'rgba(255,255,255,0.7)', marginTop: '1px' }}>{count}</span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button className="pp-btn-primary" onClick={() => { setEditPaie(null); setShowForm(true) }}>
            <Plus size={15} /> Nouveau bulletin
          </button>
        </div>
      </div>

      {error && (
        <div className="pp-alert">⚠ {error}<button onClick={() => setError(null)}>×</button></div>
      )}

      {/* ── Recherche ── */}
      <div className="pp-search-wrapper">
        <div className="pp-search-box">
          <Search className="pp-search-icon" size={14} />
          <input
            type="text"
            className="pp-search-input"
            placeholder="Rechercher par agent, matricule..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Onglet "Tous les bulletins" + sélecteur mois Jan–Déc ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>

        {/* Onglet unique "Tous les bulletins" */}
        <button
          className="pp-tab active"
          style={{ flexShrink: 0 }}
          onClick={() => setFilterMois(null)}
        >
          Tous les bulletins
          <span className="pp-tab-count">({groupedPaies[0]?.paies.length ?? 0})</span>
        </button>

        {/* Section mois Jan–Déc */}
        <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#fff', border: '1px solid #e2e6ef',
            borderRadius: '10px', padding: '6px 10px',
            flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9aa3b5', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '4px', whiteSpace: 'nowrap' }}>
              {currentYear}
            </span>
            {MOIS_COURTS.map((m, idx) => {
              const moisNum = idx + 1
              const isActive = filterMois === moisNum
              const hasPaies = paies.some(p => p.mois === moisNum)
              return (
                <button
                  key={m}
                  onClick={() => setFilterMois(isActive ? null : moisNum)}
                  style={{
                    padding: '4px 10px', borderRadius: '6px',
                    border: '1px solid',
                    borderColor: isActive ? '#1a1f3c' : hasPaies ? '#c5ccd9' : '#e2e6ef',
                    background: isActive ? '#1a1f3c' : 'transparent',
                    color: isActive ? '#fff' : hasPaies ? '#5a6478' : '#c5ccd9',
                    fontSize: '11px', fontWeight: isActive ? 700 : 400,
                    cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    transition: 'all 0.15s',
                    position: 'relative',
                  }}
                  title={`${MOIS_LONGS[idx]} ${currentYear}`}
                >
                  {m}
                  {/* Point vert si bulletins existent */}
                  {hasPaies && !isActive && (
                    <span style={{ position: 'absolute', top: '2px', right: '2px', width: '5px', height: '5px', borderRadius: '50%', background: '#27ae60' }} />
                  )}
                </button>
              )
            })}

        </div>
      </div>

      {/* ── Tableau ── */}
      <div className="pp-table-wrapper">
        {loading ? (
          <div className="pp-empty"><span className="pp-spinner" /> Chargement...</div>
        ) : displayedPaies.length === 0 ? (
          <div className="pp-empty">
            {filterMois !== null
              ? `Aucun bulletin pour ${MOIS_LONGS[filterMois - 1]} ${currentYear}`
              : 'Aucun bulletin trouvé pour cette période'}
          </div>
        ) : (
          <table className="pp-table">
            <thead>
              <tr>
                {['#', 'Agent', 'Période', 'Salaire brut', 'IGR', 'PA', 'Net à payer', 'Mode', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedPaies.map((p, i) => {
                const net = calculateNet(p)
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
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#5a6478' }}>
                        {MOIS_COURTS[p.mois - 1]} {p.annee}
                      </span>
                    </td>
                    <td className="pp-cell-num">{(p.salaire_brut ?? 0).toLocaleString('fr-MG')} Ar</td>
                    <td className="pp-cell-red">− {(p.IGR ?? 0).toLocaleString('fr-MG')} Ar</td>
                    <td className="pp-cell-red">− {(p.PA ?? 0).toLocaleString('fr-MG')} Ar</td>
                    <td><span className="pp-net">{net.toLocaleString('fr-MG')} Ar</span></td>
                    <td>
                      <span className="pp-mode" style={{ background: modeColor.bg, color: modeColor.color }}>
                        {p.mode_paie}
                      </span>
                    </td>
                    <td>
                      <div className="pp-actions">
                        <button className="pp-icon-btn" title="Voir" onClick={() => setViewPaie(p)}><Eye size={13} /></button>
                        <button className="pp-icon-btn pp-icon-btn--edit" title="Modifier" onClick={() => { setEditPaie(p); setShowForm(true) }}><Pencil size={13} /></button>
                        <button className="pp-icon-btn pp-icon-btn--delete" title="Supprimer" onClick={() => handleDelete(p.Id_paie)}><Trash2 size={13} /></button>
                        <button className="ap-btn-secondary" title="Exporter PDF" onClick={() => exportPdf(p.Id_paie)}><Download size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {lastPage > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #e2e6ef', background: page === 1 ? '#f8f9fc' : '#fff', color: page === 1 ? '#c5ccd9' : '#1a1f3c', cursor: page === 1 ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '12px' }}>← Préc.</button>
          {Array.from({ length: lastPage }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid', borderColor: p === page ? '#1a1f3c' : '#e2e6ef', background: p === page ? '#1a1f3c' : '#fff', color: p === page ? '#fff' : '#1a1f3c', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', fontWeight: p === page ? 700 : 400 }}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #e2e6ef', background: page === lastPage ? '#f8f9fc' : '#fff', color: page === lastPage ? '#c5ccd9' : '#1a1f3c', cursor: page === lastPage ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '12px' }}>Suiv. →</button>
        </div>
      )}

      {/* ── Modal Détail ── */}
      {viewPaie && (
        <div className="pp-modal-overlay">
          <div className="pp-modal">
            <div className="pp-modal-header">
              <div className="pp-modal-header-content">
                <div className="pp-modal-icon"><FileText size={22} /></div>
                <div>
                  <div className="pp-modal-title">
                    Bulletin #{viewPaie.Id_paie} — {MOIS_LONGS[viewPaie.mois - 1]} {viewPaie.annee}
                  </div>
                  <div className="pp-modal-sub">
                    {viewPaie.agent
                      ? `${viewPaie.agent.civilite} ${viewPaie.agent.nom} ${viewPaie.agent.prenoms || ''} · ${viewPaie.agent.num_matricule}`
                      : '—'}
                  </div>
                </div>
              </div>
              <button className="pp-modal-close" onClick={() => setViewPaie(null)}>×</button>
            </div>

            <div className="pp-modal-body">
              <p className="pp-modal-section-title">Rémunérations</p>
              <div className="pp-modal-grid">
                {[
                  { label: 'Salaire brut',      value: viewPaie.salaire_brut },
                  { label: 'Indice',             value: viewPaie.Indice },
                  { label: 'Prime',              value: viewPaie.prime },
                  { label: 'Prime spéciale',     value: viewPaie.prime_speciale },
                  { label: "Prime fin d'année",  value: viewPaie.prime_fin_annee },
                  { label: 'Allocation',         value: viewPaie.alloc },
                  { label: 'Logement',           value: viewPaie.logement },
                  { label: 'Scolarité',          value: viewPaie.scola },
                  { label: 'Remboursement',      value: viewPaie.remboursement },
                  { label: 'Rappel',             value: viewPaie.rappel },
                ].map(({ label, value }) => (
                  <div key={label} className="pp-modal-field">
                    <div className="pp-modal-field-label">{label}</div>
                    <div className="pp-modal-field-value">{(value ?? 0).toLocaleString('fr-MG')} Ar</div>
                  </div>
                ))}
              </div>

              <p className="pp-modal-section-title" style={{ marginTop: 16 }}>Déductions</p>
              <div className="pp-modal-grid">
                <div className="pp-modal-field">
                  <div className="pp-modal-field-label">IGR</div>
                  <div className="pp-modal-field-value red">− {(viewPaie.IGR ?? 0).toLocaleString('fr-MG')} Ar</div>
                </div>
                <div className="pp-modal-field">
                  <div className="pp-modal-field-label">PA / CNAPS</div>
                  <div className="pp-modal-field-value red">− {(viewPaie.PA ?? 0).toLocaleString('fr-MG')} Ar</div>
                </div>
              </div>

              <div className="pp-modal-net">
                <span>Net à payer</span>
                <span className="pp-modal-net-amount">{calculateNet(viewPaie).toLocaleString('fr-MG')} Ar</span>
              </div>

              <p className="pp-modal-section-title" style={{ marginTop: 16 }}>Informations</p>
              <div className="pp-modal-grid">
                {[
                  { label: 'Mode de paie',   value: viewPaie.mode_paie },
                  { label: "Date d'effet",   value: viewPaie.date_effet || '—' },
                  { label: 'Chapitre',       value: viewPaie.chap || '—' },
                  { label: 'Article',        value: viewPaie.art || '—' },
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
              <button className="pp-btn-primary" onClick={() => { setViewPaie(null); setEditPaie(viewPaie); setShowForm(true) }}>
                <Pencil size={13} /> Modifier
              </button>
            </div>
          </div>
        </div>
      )}

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