import api from './api'

export interface DashboardStats {
  agents: {
    total:         number
    fonctionnaires: number
    contractuels:  number
    stagiaires:    number
    vacataires:    number
  }
  paie: {
    masse_totale:   number
    mois_en_cours:  string
  }
  carrieres:     number
  reclassements: number
  preembauches:  number
  fonctions:     number
}

export interface EvolutionMois {
  mois:        string
  effectifs:   number
  recrutements:number
  masseAriary: number
}

export interface RepartitionStatut {
  name:  string
  value: number
  color: string
}

// ── Charger toutes les stats en parallèle ──────────────────────────────────
export const getDashboardData = async () => {
  const [
    agentsRes,
    paiesRes,
    carrieresRes,
    reclassementsRes,
    preembauchementsRes,
    fonctionsRes,
    statutsRes,
  ] = await Promise.allSettled([
    api.get('/agents',         { params: { per_page: 1 } }),
    api.get('/paies',          { params: { per_page: 200 } }),
    api.get('/carrieres',      { params: { per_page: 1 } }),
    api.get('/reclassements',  { params: { per_page: 1 } }),
    api.get('/preembauches',   { params: { per_page: 1 } }),
    api.get('/fonctions',      { params: { per_page: 1 } }),
    api.get('/statuts'),
  ])

  const getValue = (res: PromiseSettledResult<any>, path: string, fallback: any = 0) => {
    if (res.status === 'rejected') return fallback
    const parts = path.split('.')
    let val = res.value.data
    for (const p of parts) val = val?.[p]
    return val ?? fallback
  }

  // Totaux depuis meta
  const totalAgents       = getValue(agentsRes,            'meta.total', 0)
  const totalCarrieres    = getValue(carrieresRes,         'meta.total', 0)
  const totalReclassements= getValue(reclassementsRes,     'meta.total', 0)
  const totalPreembauches = getValue(preembauchementsRes,  'meta.total', 0)
  const totalFonctions    = getValue(fonctionsRes,         'meta.total', 0)

  // Agents par statut depuis les données
  const agentsData: any[] = agentsRes.status === 'fulfilled'
    ? (agentsRes.value.data.data ?? []) : []

  // Paies pour masse salariale
  const paiesData: any[] = paiesRes.status === 'fulfilled'
    ? (paiesRes.value.data.data ?? []) : []

  const masseTotale = paiesData.reduce((sum: number, p: any) => {
    const net = (Number(p.salaire_brut ?? 0) + Number(p.prime ?? 0) +
      Number(p.prime_speciale ?? 0) + Number(p.prime_fin_annee ?? 0) +
      Number(p.alloc ?? 0) + Number(p.logement ?? 0) +
      Number(p.scola ?? 0) + Number(p.remboursement ?? 0) + Number(p.rappel ?? 0))
      - (Number(p.IGR ?? 0) + Number(p.PA ?? 0))
    return sum + net
  }, 0)

  // Mois en cours
  const now = new Date()
  const moisCourant = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  // Statuts pour répartition (depuis API ou fallback)
  const statutsData: any[] = statutsRes.status === 'fulfilled'
    ? (statutsRes.value.data.data ?? statutsRes.value.data ?? []) : []

  const STATUT_COLORS: Record<string, string> = {
    'Fonctionnaire': '#1a1f3c',
    'Contractuel':   '#27ae60',
    'Stagiaire':     '#f39c12',
    'Vacataire':     '#c0392b',
  }

  return {
    stats: {
      totalAgents,
      totalCarrieres,
      totalReclassements,
      totalPreembauches,
      totalFonctions,
      masseTotale,
      moisCourant,
    },
    repartitionStatut: statutsData.map((s: any) => ({
      name:  s.type_statut,
      value: 0, // sera enrichi si on a les agents par statut
      color: STATUT_COLORS[s.type_statut] ?? '#9aa3b5',
    })),
    paiesData,
  }
}

// ── Évolution sur 6 mois depuis les paies ─────────────────────────────────
export const getEvolutionData = async (): Promise<EvolutionMois[]> => {
  const MOIS = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc']
  const now  = new Date()

  // Générer les 12 derniers mois
  const mois12: { mois: string; month: number; year: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    mois12.push({ mois: MOIS[d.getMonth()], month: d.getMonth() + 1, year: d.getFullYear() })
  }

  try {
    const [agentsRes, paiesRes, preembRes] = await Promise.allSettled([
      api.get('/agents', { params: { per_page: 500 } }),
      api.get('/paies',  { params: { per_page: 500 } }),
      api.get('/preembauches', { params: { per_page: 500 } }),
    ])

    const paies:     any[] = paiesRes.status    === 'fulfilled' ? (paiesRes.value.data.data    ?? []) : []
    const preem:     any[] = preembRes.status   === 'fulfilled' ? (preembRes.value.data.data   ?? []) : []
    const totalAgents      = agentsRes.status   === 'fulfilled' ? (agentsRes.value.data.meta?.total ?? 0) : 0

    return mois12.map(({ mois, month, year }) => {
      // Masse salariale du mois
      const paiesMois = paies.filter((p: any) => p.mois === month && p.annee === year)
      const masse = paiesMois.reduce((sum: number, p: any) => {
        return sum + (Number(p.salaire_brut ?? 0) + Number(p.prime ?? 0) +
          Number(p.alloc ?? 0) + Number(p.logement ?? 0)) / 1_000_000
      }, 0)

      // Recrutements du mois (préembauches)
      const recruMois = preem.filter((p: any) => {
        const d = p.Date_recrutement ? new Date(p.Date_recrutement) : null
        return d && d.getMonth() + 1 === month && d.getFullYear() === year
      }).length

      return {
        mois,
        effectifs:    totalAgents,
        recrutements: recruMois,
        masseAriary:  Math.round(masse * 10) / 10 || 0,
      }
    })
  } catch {
    // Fallback avec données vides
    return mois12.map(({ mois }) => ({ mois, effectifs: 0, recrutements: 0, masseAriary: 0 }))
  }
}

// ── Répartition agents par statut ─────────────────────────────────────────
export const getRepartitionStatut = async (): Promise<RepartitionStatut[]> => {
  const COLORS: Record<string, string> = {
    'Fonctionnaire': '#1a1f3c',
    'Contractuel':   '#27ae60',
    'Stagiaire':     '#f39c12',
    'Vacataire':     '#c0392b',
  }
  try {
    // Charger tous les agents avec leur statut
    const res = await api.get('/agents', { params: { per_page: 500 } })
    const agents: any[] = res.data.data ?? []

    const counts: Record<string, number> = {}
    agents.forEach((a: any) => {
      const s = a.statut?.type_statut ?? 'Autre'
      counts[s] = (counts[s] ?? 0) + 1
    })

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: COLORS[name] ?? '#9aa3b5',
    }))
  } catch {
    return []
  }
}