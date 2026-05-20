import api from './api'

export interface PreembaucheFromAPI {
  Id_preembauche:          number
  N_contrat:               string
  Date_recrutement:        string
  Date_recrutement1:       string
  Deb_stage_PreEmb:        string
  Deb_stage_PreEmb_txt:    string
  Fin_stage_PreEmb:        string
  Fin_stage_PreEmb_txt:    string
  Montant_PreEmb:          number | string
  Montant_PreEmb_Contrat:  number | string
  Id_agent:                number
  Id_contrat:              number
  agent?: {
    Id_agent:      number
    nom:           string
    prenoms:       string
    num_matricule: string
    civilite:      string
  }
  contrat?: {
    Id_contrat:   number
    type_contrat: string
    duree:        string
  }
  created_at?: string
}

export interface PreembauchePayload {
  N_contrat:               string
  Date_recrutement:        string
  Date_recrutement1:       string
  Deb_stage_PreEmb:        string
  Deb_stage_PreEmb_txt:    string
  Fin_stage_PreEmb:        string
  Fin_stage_PreEmb_txt:    string
  Montant_PreEmb:          number
  Montant_PreEmb_Contrat:  number
  Id_agent:                number
  Id_contrat:              number
}

export const getPreembauches   = async (params: { page?: number; per_page?: number; search?: string } = {}) =>
  api.get('/preembauches', { params })
export const getPreembauche    = async (id: number) => api.get(`/preembauches/${id}`)
export const createPreembauche = async (payload: PreembauchePayload) => api.post('/preembauches', payload)
export const updatePreembauche = async (id: number, payload: Partial<PreembauchePayload>) => api.put(`/preembauches/${id}`, payload)
export const deletePreembauche = async (id: number) => api.delete(`/preembauches/${id}`)
export const getPreembaucheAgent = async (Id_agent: number) => api.get(`/agents/${Id_agent}/preembauches`)