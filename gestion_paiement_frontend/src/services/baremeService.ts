import api from './api'

export interface BaremeFromAPI {
  Id_bareme:       number
  Indice:          number
  salaire_base:    number
  salaire_mensuel: number
  anciennete:      number
  DIF:             number
  rappell:         number
  created_at?:     string
}

export interface BaremePayload {
  Indice:          number
  salaire_base:    number
  salaire_mensuel: number
  anciennete:      number
  DIF:             number
  rappell:         number
}

export const getBaremes   = async (params: { page?: number; per_page?: number } = {}) => api.get('/baremes', { params })
export const getBareme    = async (id: number) => api.get(`/baremes/${id}`)
export const createBareme = async (payload: BaremePayload) => api.post('/baremes', payload)
export const updateBareme = async (id: number, payload: Partial<BaremePayload>) => api.put(`/baremes/${id}`, payload)
export const deleteBareme = async (id: number) => api.delete(`/baremes/${id}`)