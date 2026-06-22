import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Plus, Eye, Pencil, Trash2, Search, FileText, Download, History, ChevronDown, Gift, CheckSquare, Square } from 'lucide-react'
import { getPaies, getPaie, createPaie, updatePaie, deletePaie, type PaieFromAPI, type PaiePayload } from '../services/paieService'
import { MoisBar } from '../components/MoisBar'
import { getFonctionsAgent } from '../services/fonctionService'
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

const getModeClass = (mode: string) => {
  switch (mode) {
    case 'Virement': return 'pp-mode--virement'
    case 'Espèces': return 'pp-mode--especes'
    case 'Chèque': return 'pp-mode--cheque'
    default: return ''
  }
}

interface PaieGroup {
  key: string; label: string
  mois?: number; annee?: number
  paies: PaieFromAPI[]
}

interface PrimePayload {
  prime: number
  prime_speciale: number
  prime_fonction: number
  prime_fin_annee: number
  motif: string
}

// ── Modal Prime ───────────────────────────────────────────────────────────────

const PrimeModal: React.FC<{
  agents: PaieFromAPI[]   
  onClose: () => void
  onApply: (ids: number[], prime: PrimePayload) => void
}> = ({ agents, onClose, onApply }) => {
  const [prime, setPrime] = useState('')
  const [primeSpeciale, setPrimeSpeciale] = useState('')
  const [primeFonction, setPrimeFonction] = useState('')
  const [primeFinAnnee, setPrimeFinAnnee] = useState('')
  const [motif, setMotif] = useState('')
  const [error, setError] = useState('')

  const isMultiple = agents.length > 1

  const toNumber = (value: string) => {
    const parsed = parseFloat(value)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
  }

  const handleSubmit = () => {
    const payload = {
      prime: toNumber(prime),
      prime_speciale: toNumber(primeSpeciale),
      prime_fonction: toNumber(primeFonction),
      prime_fin_annee: toNumber(primeFinAnnee),
      motif,
    }

    if (payload.prime <= 0 && payload.prime_speciale <= 0 && payload.prime_fonction <= 0 && payload.prime_fin_annee <= 0) {
      setError('Veuillez saisir au moins une prime valide')
      return
    }

    onApply(agents.map(a => a.Id_paie), payload)
    onClose()
  }

  useEffect(() => {
    // Préremplir la prime de fonction pour une prime individuelle depuis la fonction la plus récente
    if (isMultiple) return
    const agentId = agents[0]?.Id_agent ?? agents[0]?.agent?.Id_agent
    if (!agentId) return

    // Si le bulletin a déjà une prime_fonction, l'utiliser prioritairement
    const existing = agents[0]?.prime_fonction ?? 0
    if (existing && existing > 0) {
      setPrimeFonction(String(existing))
      return
    }

    let mounted = true
    ;(async () => {
      try {
        const res = await getFonctionsAgent(agentId)
        const data = res.data?.data ?? res.data ?? []
        const list = Array.isArray(data) ? data : [data]
        const latest = list
          .filter(f => !!f)
          .sort((a: any, b: any) => {
            const ad = new Date(a.date_affectation).getTime() || 0
            const bd = new Date(b.date_affectation).getTime() || 0
            return bd - ad
          })[0]
        if (mounted && latest?.fonction_prime) setPrimeFonction(String(latest.fonction_prime))
      } catch (_) {}
    })()
    return () => { mounted = false }
  }, [agents, isMultiple])

  return (
    <div className="pp-prime-overlay">
      <div className="pp-prime-modal">

        {/* Header */}
        <div className="pp-prime-header">
          <div>
            <div className="pp-prime-header-content">
              <Gift size={16} color="rgba(255,255,255,0.7)" />
              <h2 className="pp-prime-header-title">
                {isMultiple ? `Prime groupée — ${agents.length} agents` : 'Prime individuelle'}
              </h2>
            </div>
            <p className="pp-prime-header-subtitle">
              {isMultiple
                ? `La prime sera appliquée à ${agents.length} bulletin(s) sélectionné(s)`
                : agents[0]?.agent
                  ? `${agents[0].agent.civilite} ${agents[0].agent.nom} · ${agents[0].agent.num_matricule}`
                  : `Bulletin #${agents[0]?.Id_paie}`
              }
            </p>
          </div>
          <button onClick={onClose} className="pp-prime-close">×</button>
        </div>

        {/* Agents sélectionnés (multi) */}
        {isMultiple && (
          <div className="pp-prime-agents">
            <p className="pp-prime-agents-title">Agents concernés</p>
            <div className="pp-prime-agents-list">
              {agents.map(a => (
                <span key={a.Id_paie} className="pp-prime-agent-tag">
                  {a.agent ? `${a.agent.nom} (${a.agent.num_matricule})` : `#${a.Id_paie}`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Formulaire */}
        <div className="pp-prime-body">

          <div>
            <label className="pp-prime-label">Prime</label>
            <div className="pp-prime-field">
              <input
                className="pp-prime-input pp-prime-input--with-suffix"
                type="number"
                min="0"
                placeholder="Ex: 150000"
                value={prime}
                onChange={e => { setPrime(e.target.value); setError('') }}
              />
              <span className="pp-prime-suffix">Ar</span>
            </div>
          </div>

          <div>
            <label className="pp-prime-label">Prime spéciale</label>
            <div className="pp-prime-field">
              <input
                className="pp-prime-input pp-prime-input--with-suffix"
                type="number"
                min="0"
                placeholder="Ex: 50000"
                value={primeSpeciale}
                onChange={e => { setPrimeSpeciale(e.target.value); setError('') }}
              />
              <span className="pp-prime-suffix">Ar</span>
            </div>
          </div>

          <div>
            <label className="pp-prime-label">Prime fin d'année</label>
            <div className="pp-prime-field">
              <input
                className="pp-prime-input pp-prime-input--with-suffix"
                type="number"
                min="0"
                placeholder="Ex: 100000"
                value={primeFinAnnee}
                onChange={e => { setPrimeFinAnnee(e.target.value); setError('') }}
              />
              <span className="pp-prime-suffix">Ar</span>
            </div>
          </div>

          <div>
            <label className="pp-prime-label">Prime de fonction</label>
            <div className="pp-prime-field">
              <input
                className="pp-prime-input pp-prime-input--with-suffix"
                type="number"
                min="0"
                placeholder="Ex: 75000"
                value={primeFonction}
                onChange={e => { setPrimeFonction(e.target.value); setError('') }}
              />
              <span className="pp-prime-suffix">Ar</span>
            </div>
          </div>

          {error && <p className="pp-prime-error">{error}</p>}

          {isMultiple && (toNumber(prime) || toNumber(primeSpeciale) || toNumber(primeFinAnnee) || toNumber(primeFonction)) ? (
            <p className="pp-prime-total">
              Total appliqué : {(
                (toNumber(prime) + toNumber(primeSpeciale) + toNumber(primeFinAnnee) + toNumber(primeFonction)) * agents.length
              ).toLocaleString('fr-MG')} Ar ({agents.length} bulletin{agents.length > 1 ? 's' : ''})
            </p>
          ) : null}

          <div className="pp-prime-note">
            <p className="pp-prime-note-title">
              Primes incluses dans ce modal
            </p>
            <ul className="pp-prime-note-list">
              <li>Prime</li>
              <li>Prime spéciale</li>
              <li>Prime fin d'année</li>
              <li>Prime de fonction</li>
            </ul>
          </div>

          {/* Motif */}
          <div>
            <label className="pp-prime-label">Motif / Observation</label>
            <textarea
              className="pp-prime-input pp-prime-textarea"
              placeholder="Ex: Prime de performance Q2 2026..."
              value={motif}
              onChange={e => setMotif(e.target.value)}
            />
          </div>

          {/* Aperçu */}
          {(toNumber(prime) || toNumber(primeSpeciale) || toNumber(primeFinAnnee) || toNumber(primeFonction)) > 0 && (
            <div className="pp-prime-preview">
              <div>
                <p className="pp-prime-preview-title">Aperçu</p>
                <p className="pp-prime-preview-label">Primes sélectionnées</p>
              </div>
              <span className="pp-prime-preview-amount">
                + {(
                  toNumber(prime) + toNumber(primeSpeciale) + toNumber(primeFinAnnee) + toNumber(primeFonction)
                ).toLocaleString('fr-MG')} Ar
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pp-prime-footer">
          <button onClick={onClose} className="pp-prime-cancel">
            Annuler
          </button>
          <button onClick={handleSubmit} className="pp-prime-submit">
            <Gift size={14} /> Appliquer la prime
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page principale

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
  // activeTab supprimé — le seul onglet actif est toujours "Tous les bulletins"

  // ── Sélection multi-agents ───────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [primeTargets, setPrimeTargets] = useState<PaieFromAPI[] | null>(null) // null = fermé

  // ── Historique ───────────────────────────────────────────────────────────
  const [showHistorique, setShowHistorique] = useState(false)
  const [histAnnee, setHistAnnee]           = useState<number | null>(null)
  const historiqueRef = useRef<HTMLDivElement>(null)

  const currentYear = new Date().getFullYear()
  const [filterMois, setFilterMois] = useState<number | null>(new Date().getMonth() + 1)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (historiqueRef.current && !historiqueRef.current.contains(e.target as Node))
        setShowHistorique(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const loadPaies = async () => {
    setLoading(true); setError(null)
    try {
      const params: Record<string, any> = { page, per_page: 15 }
      if (search.trim())   params.search   = search.trim()
      if (filterMois)      params.mois     = filterMois
      if (filterMois)      params.annee    = currentYear
      const res = await getPaies(params)
      const raw = res.data?.data ?? res.data ?? []
      setPaies(raw)
      if (res.data?.meta) {
        setLastPage(res.data.meta.last_page ?? 1)
        setTotal(res.data.meta.total ?? raw.length)
      }
    } catch { setError('Impossible de charger les bulletins de paie') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadPaies() }, [page])

  useEffect(() => { setPage(1); loadPaies() }, [search, filterMois])

  const groupedPaies: PaieGroup[] = [{ key: 'all', label: 'Tous les bulletins', paies }]

  const anneesDisponibles = useMemo(() => {
    return [...new Set(paies.map(p => p.annee))].sort((a, b) => b - a)
  }, [paies])

  const currentGroup   = groupedPaies[0]
  const displayedPaies = currentGroup.paies

  const calculateNet = (p: PaieFromAPI) => {
    const brut = (p.salaire_brut ?? 0) + (p.prime ?? 0) + (p.prime_speciale ?? 0) +
                 (p.prime_fin_annee ?? 0) + (p.prime_fonction ?? 0) + (p.alloc ?? 0) + (p.logement ?? 0) +
                 (p.scola ?? 0) + (p.remboursement ?? 0) + (p.rappel ?? 0)
    return brut - (p.IGR ?? 0) - (p.PA ?? 0)
  }

  // ── Sélection ──────────────────────────────────────────────────────────
  const toggleSelect = (id: number) =>
    setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const toggleAll = () => {
    if (selectedIds.size === displayedPaies.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(displayedPaies.map(p => p.Id_paie)))
  }

  const allSelected  = displayedPaies.length > 0 && selectedIds.size === displayedPaies.length
  const someSelected = selectedIds.size > 0 && !allSelected

  // ── Appliquer prime (mock — à brancher sur API) ─────────────────────────
  const handleApplyPrime = async (ids: number[], prime: PrimePayload) => {
    try {
      const updateTasks = ids.map(async id => {
        const res = await getPaie(id)
        const paie = res.data?.data ?? res.data

        const payload: PaiePayload = {
          mois: paie.mois,
          annee: paie.annee,
          salaire_brut: paie.salaire_brut,
          prime: (paie.prime ?? 0) + prime.prime,
          prime_fonction: (paie.prime_fonction ?? 0) + prime.prime_fonction,
          scola: paie.scola ?? 0,
          remboursement: paie.remboursement ?? 0,
          Indice: paie.Indice,
          prime_speciale: (paie.prime_speciale ?? 0) + prime.prime_speciale,
          prime_fin_annee: (paie.prime_fin_annee ?? 0) + prime.prime_fin_annee,
          alloc: paie.alloc ?? 0,
          logement: paie.logement ?? 0,
          IGR: paie.IGR ?? 0,
          rappel: paie.rappel ?? 0,
          PA: paie.PA ?? 0,
          mode_paie: paie.mode_paie,
          chap: paie.chap ?? '',
          art: paie.art ?? '',
          date_effet: paie.date_effet ?? new Date().toISOString().slice(0, 10),
          Id_agent: paie.Id_agent,
          Id_enfant: paie.Id_enfant ?? null,
        }

        return updatePaie(id, payload)
      })

      await Promise.all(updateTasks)

      const parts = [
        prime.prime > 0 ? `Prime : ${prime.prime.toLocaleString('fr-MG')} Ar` : null,
        prime.prime_speciale > 0 ? `Prime spéciale : ${prime.prime_speciale.toLocaleString('fr-MG')} Ar` : null,
        prime.prime_fonction > 0 ? `Prime de fonction : ${prime.prime_fonction.toLocaleString('fr-MG')} Ar` : null,
        prime.prime_fin_annee > 0 ? `Prime fin d'année : ${prime.prime_fin_annee.toLocaleString('fr-MG')} Ar` : null,
      ].filter(Boolean)

      alert(`✅ Primes appliquées à ${ids.length} bulletin(s).\n\n${parts.join('\n')}\n${prime.motif ? `\nMotif : ${prime.motif}` : ''}`)
      setSelectedIds(new Set())
      loadPaies()
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Impossible d'appliquer les primes.")
    }
  }

  const handleSave = async (data: PaiePayload) => {
    if (editPaie) { await updatePaie(editPaie.Id_paie, data); alert('Bulletin modifié') }
    else          { await createPaie(data); alert('Bulletin créé') }
    loadPaies(); setShowForm(false); setEditPaie(null)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce bulletin ?')) return
    try { await deletePaie(id); alert('Bulletin supprimé'); loadPaies() }
    catch (err: any) { alert(err.response?.data?.message ?? 'Erreur') }
  }

  const goToHistorique = (_annee: number, mois: number) => {
    setFilterMois(mois)
    setShowHistorique(false); setHistAnnee(null)
  }

  const selectedPaies = displayedPaies.filter(p => selectedIds.has(p.Id_paie))

  return (
    <div className="pp-page">

      {/* ── Header ── */}
      <div className="pp-header">
        <div>
          <h1 className="pp-title">Bulletins de Paie</h1>
          <p className="pp-subtitle">{total} bulletin{total > 1 ? 's' : ''} enregistré{total > 1 ? 's' : ''}</p>
        </div>
        <div className="pp-header-actions">

          {/* Prime groupée — visible si sélection */}
          {selectedIds.size > 0 && (
            <button
              onClick={() => setPrimeTargets(selectedPaies)}
              className="pp-prime-group-btn"
            >
              <Gift size={14} /> Prime — {selectedIds.size} agent{selectedIds.size > 1 ? 's' : ''}
            </button>
          )}

          {/* Historique */}
          <div ref={historiqueRef} className="pp-historique-wrapper">
            <button className="ap-btn-secondary pp-historique-btn" onClick={() => setShowHistorique(v => !v)}>
              <History size={14} /> Historique
              <ChevronDown size={12} className={`pp-historique-chevron ${showHistorique ? 'rotated' : ''}`} />
            </button>

            {showHistorique && (
              <div className="pp-historique-dropdown">
                <div className="pp-historique-header">
                  <p className="pp-historique-title">📅 Historique des paies</p>
                  <p className="pp-historique-subtitle">Sélectionner une année puis un mois</p>
                </div>
                <div className="pp-historique-list">
                  {anneesDisponibles.length === 0
                    ? <div className="pp-historique-empty">Aucun historique</div>
                    : anneesDisponibles.map(annee => (
                      <div key={annee}>
                        <button onClick={() => setHistAnnee(histAnnee === annee ? null : annee)} className={`pp-historique-year-btn ${histAnnee === annee ? 'active' : ''}`}>
                          <span className={`pp-historique-year-label ${histAnnee === annee ? 'active' : ''}`}>{annee}</span>
                          <span className={`pp-historique-year-meta ${histAnnee === annee ? 'active' : ''}`}>
                            {paies.filter(p => p.annee === annee).length} bulletins
                            <ChevronDown size={12} className={`pp-historique-chevron pp-historique-chevron--spaced ${histAnnee === annee ? 'rotated' : ''}`} />
                          </span>
                        </button>
                        {histAnnee === annee && (
                          <div className="pp-historique-month-grid">
                            {MOIS_COURTS.map((m, idx) => {
                              const moisNum = idx + 1
                              const hasPaies = paies.some(p => p.annee === annee && p.mois === moisNum)
                              const count = paies.filter(p => p.annee === annee && p.mois === moisNum).length
                              return (
                                <button key={m} onClick={() => hasPaies && goToHistorique(annee, moisNum)} disabled={!hasPaies}
                                  className={`pp-historique-month-btn ${hasPaies ? 'active' : ''}`}
                                  title={hasPaies ? `${MOIS_LONGS[idx]} ${annee} — ${count} bulletin(s)` : 'Aucun bulletin'}
                                >
                                  {m}
                                  {hasPaies && <span className="pp-historique-month-count">{count}</span>}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>

          <button className="pp-btn-primary" onClick={() => { setEditPaie(null); setShowForm(true) }}>
            <Plus size={15} /> Nouveau bulletin
          </button>
        </div>
      </div>

      {error && <div className="pp-alert">⚠ {error}<button onClick={() => setError(null)}>×</button></div>}

      {/* ── Recherche ── */}
      <div className="pp-search-wrapper">
        <div className="pp-search-box">
          <Search className="pp-search-icon" size={14} />
          <input type="text" className="pp-search-input" placeholder="Rechercher par agent, matricule..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* ── Onglet + mois ── */}
      <div className="pp-toolbar">
        <button
          className={`pp-tab pp-tab--flat ${filterMois === null ? 'active' : ''}`}
          onClick={() => setFilterMois(null)}
        >
          Tous les bulletins <span className="pp-tab-count">({total})</span>
        </button>
        <div className="pp-toolbar-filter">
          <span className="pp-toolbar-year">{currentYear}</span>
          <MoisBar
            currentYear={currentYear}
            filterMois={filterMois}
            onSelectMois={setFilterMois}
            onBulletinsGeneres={loadPaies}
          />
        </div>

        {/* Barre de sélection */}
        {selectedIds.size > 0 && (
          <div className="pp-selection-banner">
            <span className="pp-selection-count">{selectedIds.size} sélectionné{selectedIds.size > 1 ? 's' : ''}</span>
            <button onClick={() => setSelectedIds(new Set())} className="pp-selection-clear">Tout désélectionner</button>
          </div>
        )}
      </div>

      {/* ── Tableau ── */}
      <div className="pp-table-wrapper">
        {loading ? (
          <div className="pp-empty"><span className="pp-spinner" /> Chargement...</div>
        ) : displayedPaies.length === 0 ? (
          <div className="pp-empty">
            {filterMois !== null ? `Aucun bulletin pour ${MOIS_LONGS[filterMois - 1]} ${currentYear}` : 'Aucun bulletin trouvé'}
          </div>
        ) : (
          <table className="pp-table">
            <thead>
              <tr>
                {/* Checkbox tout sélectionner */}
                <th className="pp-checkbox-th">
                  <button onClick={toggleAll} className={`pp-checkbox-btn ${allSelected || someSelected ? 'is-selected' : 'is-muted'}`}>
                    {allSelected ? <CheckSquare size={15} /> : someSelected ? <CheckSquare size={15} className="pp-checkbox-icon--muted" /> : <Square size={15} />}
                  </button>
                </th>
                {['#', 'Agent', 'Période', 'Salaire brut', 'IGR', 'PA', 'Net à payer', 'Mode', 'Actions'].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {displayedPaies.map((p, i) => {
                const net = calculateNet(p)
                const modeColor = MODE_COLORS[p.mode_paie] ?? { bg: '#f0f0f0', color: '#666' }
                const isSelected = selectedIds.has(p.Id_paie)
                return (
                  <tr key={p.Id_paie}
                    className={`pp-row ${i % 2 === 0 ? 'pp-row-even' : 'pp-row-odd'} ${isSelected ? 'is-selected' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="pp-checkbox-th">
                      <button onClick={() => toggleSelect(p.Id_paie)} className={`pp-checkbox-btn ${isSelected ? 'is-selected' : 'is-muted'}`}>
                        {isSelected ? <CheckSquare size={15} /> : <Square size={15} />}
                      </button>
                    </td>
                    <td><span className="pp-id">#{p.Id_paie}</span></td>
                    <td>
                      {p.agent ? (
                        <><div className="pp-agent-name">{p.agent.civilite} {p.agent.nom}</div>
                        <div className="pp-agent-mat">{p.agent.num_matricule}</div></>
                      ) : <span className="pp-cell-gray">—</span>}
                    </td>
                    <td><span className="pp-period">{MOIS_COURTS[p.mois - 1]} {p.annee}</span></td>
                    <td className="pp-cell-num">{(p.salaire_brut ?? 0).toLocaleString('fr-MG')} Ar</td>
                    <td className="pp-cell-red">− {(p.IGR ?? 0).toLocaleString('fr-MG')} Ar</td>
                    <td className="pp-cell-red">− {(p.PA ?? 0).toLocaleString('fr-MG')} Ar</td>
                    <td><span className="pp-net">{net.toLocaleString('fr-MG')} Ar</span></td>
                    <td><span className={`pp-mode ${getModeClass(p.mode_paie)}`}>{p.mode_paie}</span></td>
                    <td>
                      <div className="pp-actions">
                        <button className="pp-icon-btn" title="Voir" onClick={() => setViewPaie(p)}><Eye size={13} /></button>
                        <button className="pp-icon-btn pp-icon-btn--edit" title="Modifier" onClick={() => { setEditPaie(p); setShowForm(true) }}><Pencil size={13} /></button>
                        {/* ── Bouton Prime individuelle ── */}
                        <button
                          title="Ajouter une prime"
                          onClick={() => setPrimeTargets([p])}
                          className="pp-prime-action"
                        >
                          <Gift size={12} /> Prime
                        </button>
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
        <div className="pp-pagination-wrap">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="pp-pagination-btn">← Préc.</button>
          {Array.from({ length: lastPage }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`pp-pagination-page ${p === page ? 'active' : ''}`}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage} className="pp-pagination-btn">Suiv. →</button>
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
                  <div className="pp-modal-title">Bulletin #{viewPaie.Id_paie} — {MOIS_LONGS[viewPaie.mois - 1]} {viewPaie.annee}</div>
                  <div className="pp-modal-sub">
                    {viewPaie.agent ? `${viewPaie.agent.civilite} ${viewPaie.agent.nom} ${viewPaie.agent.prenoms || ''} · ${viewPaie.agent.num_matricule}` : '—'}
                  </div>
                </div>
              </div>
              <button className="pp-modal-close" onClick={() => setViewPaie(null)}>×</button>
            </div>
            <div className="pp-modal-body">
              <p className="pp-modal-section-title">Rémunérations</p>
              <div className="pp-modal-grid">
                {[
                  { label: 'Salaire brut', value: viewPaie.salaire_brut },
                  { label: 'Indice', value: viewPaie.Indice },
                  { label: 'Prime', value: viewPaie.prime },
                  { label: 'Prime spéciale', value: viewPaie.prime_speciale },
                  { label: "Prime fin d'année", value: viewPaie.prime_fin_annee },
                  { label: 'Allocation', value: viewPaie.alloc },
                  { label: 'Logement', value: viewPaie.logement },
                  { label: 'Scolarité', value: viewPaie.scola },
                  { label: 'Remboursement', value: viewPaie.remboursement },
                  { label: 'Rappel', value: viewPaie.rappel },
                  { label: 'Prime de fonction', value: viewPaie.prime_fonction },
                ].map(({ label, value }) => (
                  <div key={label} className="pp-modal-field">
                    <div className="pp-modal-field-label">{label}</div>
                    <div className="pp-modal-field-value">
                      {(value ?? 0).toLocaleString('fr-MG')}
                      {label !== 'Indice' ? ' Ar' : ''}
                    </div>
                  </div>
                ))}
              </div>
              <p className="pp-modal-section-title pp-section-spacer">Déductions</p>
              <div className="pp-modal-grid">
                <div className="pp-modal-field"><div className="pp-modal-field-label">IGR</div><div className="pp-modal-field-value red">− {(viewPaie.IGR ?? 0).toLocaleString('fr-MG')} Ar</div></div>
                <div className="pp-modal-field"><div className="pp-modal-field-label">PA / CNAPS</div><div className="pp-modal-field-value red">− {(viewPaie.PA ?? 0).toLocaleString('fr-MG')} Ar</div></div>
              </div>
              <div className="pp-modal-net">
                <span>Net à payer</span>
                <span className="pp-modal-net-amount">{calculateNet(viewPaie).toLocaleString('fr-MG')} Ar</span>
              </div>
              <p className="pp-modal-section-title pp-section-spacer">Informations</p>
              <div className="pp-modal-grid">
                {[
                  { label: 'Mode de paie', value: viewPaie.mode_paie },
                  { label: "Date d'effet", value: viewPaie.date_effet || '—' },
                  { label: 'Chapitre', value: viewPaie.chap || '—' },
                  { label: 'Article', value: viewPaie.art || '—' },
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

      {/* ── Modal Prime ── */}
      {primeTargets && (
        <PrimeModal
          agents={primeTargets}
          onClose={() => setPrimeTargets(null)}
          onApply={handleApplyPrime}
        />
      )}

      {showForm && (
        <PaieForm paie={editPaie} onSave={handleSave} onClose={() => { setShowForm(false); setEditPaie(null) }} />
      )}
    </div>
  )
}