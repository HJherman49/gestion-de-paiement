import api from './api'

export type TypeAction = 'CREATE' | 'UPDATE' | 'DELETE'

export interface HistoriqueFromAPI {
  Id_historique:     number
  table_concernee:   string
  id_enregistrement: number
  type_action:       TypeAction
  date_action:       string
  champ_modifie?:    string
  valeur_avant?:     string
  valeur_apres?:     string
  utilisateur?:      string
  created_at?:       string
}

export interface HistoriqueFilters {
  search?:            string
  table_concernee?:   string
  type_action?:       TypeAction | ''
  utilisateur?:       string
  date_debut?:        string
  date_fin?:          string
  id_enregistrement?: number
  page?:              number
  per_page?:          number
}

export interface HistoriqueStats {
  par_action:    { type_action: TypeAction; total: number }[]
  par_table:     { table_concernee: string; total: number }[]
  par_user:      { utilisateur: string; total: number }[]
  aujourd_hui:   number
  cette_semaine: number
}

export const getHistoriques = async (filters: HistoriqueFilters = {}) => {
  const params: Record<string, any> = {}
  if (filters.search)            params.search            = filters.search
  if (filters.table_concernee)   params.table_concernee   = filters.table_concernee
  if (filters.type_action)       params.type_action       = filters.type_action
  if (filters.utilisateur)       params.utilisateur       = filters.utilisateur
  if (filters.date_debut)        params.date_debut        = filters.date_debut
  if (filters.date_fin)          params.date_fin          = filters.date_fin
  if (filters.id_enregistrement) params.id_enregistrement = filters.id_enregistrement
  if (filters.page)              params.page              = filters.page
  if (filters.per_page)          params.per_page          = filters.per_page
  return api.get('/historiques', { params })
}

export const getHistoriqueStats  = async () => api.get('/historiques/stats')
export const deleteHistorique    = async (id: number) => api.delete(`/historiques/${id}`)