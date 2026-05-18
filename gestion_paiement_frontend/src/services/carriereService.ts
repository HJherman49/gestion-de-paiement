import api from './api'

export interface CarriereFromAPI {
  Id_carriere: number
  Categorie:   string
  corps:       string
  grade:       string
  classe:      string
  echelon:     string
  indice:      number
  Id_agent:    number
  Id_bareme?:  number
  agent?: {
    Id_agent:      number
    nom:           string
    prenoms:       string
    num_matricule: string
    civilite:      string
    direction?: { Sigle: string }
    service?:   { nom_service: string }
  }
  bareme?: {
    Id_bareme:    number
    indice:       number
    salaire_base: number
  }
  created_at?: string
}

export interface CarrierePayload {
  Categorie:  string
  corps:      string
  grade:      string
  classe:     string
  echelon:    string
  indice:     number
  Id_agent:   number
  Id_bareme?: number
}

export const getCarrieres   = async (params: { page?: number; per_page?: number; search?: string } = {}) =>
  api.get('/carrieres', { params })

export const getCarriere    = async (id: number) => api.get(`/carrieres/${id}`)
export const createCarriere = async (payload: CarrierePayload) => api.post('/carrieres', payload)
export const updateCarriere = async (id: number, payload: Partial<CarrierePayload>) => api.put(`/carrieres/${id}`, payload)
export const deleteCarriere = async (id: number) => api.delete(`/carrieres/${id}`)
export const getCarriereAgent = async (Id_agent: number) => api.get(`/agents/${Id_agent}/carrieres`)
export const getBaremes     = async () => api.get('/baremes')