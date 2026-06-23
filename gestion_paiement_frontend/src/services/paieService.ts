import api from './api'

export interface PaieFromAPI {
  Id_paie:         number
  mois:            number
  annee:           number
  salaire_brut:    number
  prime:           number
  prime_fonction:  number
  scola:           number
  remboursement:   number
  Indice:          number
  prime_speciale:  number
  prime_fin_annee: number
  alloc:           number
  logement:        number
  IGR:             number
  rappel:          number
  PA:              number
  mode_paie:       string
  chap:            string
  art:             string
  date_effet:      string
  Id_agent:        number
  Id_enfant?:      number
  agent?: { Id_agent: number; nom: string; prenoms: string; num_matricule: string; civilite: string }
  enfant?: { Id_enfant: number; Nb_enf: number; Nb_enf_inf_15ans: number }
}

export interface PaiePayload {
  mois:            number
  annee:           number
  salaire_brut:    number
  prime:           number
  prime_fonction:  number
  scola:           number
  remboursement:   number
  Indice:          number
  prime_speciale:  number
  prime_fin_annee: number
  alloc:           number
  logement:        number
  IGR:             number
  rappel:          number
  PA:              number
  mode_paie:       string
  chap:            string
  art:             string
  date_effet:      string
  Id_agent:        number
  Id_enfant?:      number | null
}

export interface RecapMois {
  mois: number
  nb_bulletins: number
  total_net: number
  total_primes: number
  a_des_primes: boolean
  genere: boolean
}
 
export interface RecapMoisResponse {
  data: RecapMois[]
  annee: number
}
 
/**
 * Récupère le récapitulatif de tous les mois d'une année :
 * nombre de bulletins, total net, présence de primes, et si le mois
 * a déjà été généré (utilisé pour la barre de mois).
 */
export const getRecapMois = (annee: number) =>
  api.get<RecapMoisResponse>('/paies/recap-mois', { params: { annee } })
 
/**
 * Déclenche la génération manuelle des bulletins pour un mois donné.
 * `force=true` régénère les bulletins existants qui ont le statut 'auto'
 * (ne touche jamais un bulletin déjà 'modifie').
 */
export const genererBulletinsMois = (mois: number, annee: number, force = false) =>
  api.post('/paies/generer-mois', { mois, annee, force })


export const getPaies       = async (params: { page?: number; per_page?: number; search?: string } = {}) =>
  api.get('/paies', { params })
export const getPaie        = async (id: number) => api.get(`/paies/${id}`)
export const createPaie     = async (payload: PaiePayload) => api.post('/paies', payload)
export const updatePaie     = async (id: number, payload: Partial<PaiePayload>) => api.put(`/paies/${id}`, payload)
export const deletePaie     = async (id: number) => api.delete(`/paies/${id}`)
export const getPaiesAgent  = async (Id_agent: number, page = 1) => api.get(`/agents/${Id_agent}/paies`, { params: { page } })