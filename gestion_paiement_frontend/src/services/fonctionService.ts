import api from './api'

export interface FonctionFromAPI {
  Id_fonction:      number
  nom_fonction:     string
  date_fonction:    string
  date_affectation: string
  fonction_prime:   number | null
  num_fonct:        string
  Id_direction:     number
  Id_agent:         number
  agent?: {
    Id_agent:      number
    nom:           string
    prenoms:       string
    num_matricule: string
    civilite:      string
  }
  direction?: {
    Id_direction:  number
    nom_direction: string
    sigle:         string
  }
  created_at?: string
}

export interface FonctionPayload {
  nom_fonction:     string
  date_fonction:    string
  date_affectation: string
  fonction_prime?:  number
  num_fonct:        string
  Id_direction:     number
  Id_agent:         number
}

export const getFonctions   = async (params: { page?: number; per_page?: number; search?: string } = {}) =>
  api.get('/fonctions', { params })
export const getFonction    = async (id: number) => api.get(`/fonctions/${id}`)
export const createFonction = async (payload: FonctionPayload) => api.post('/fonctions', payload)
export const updateFonction = async (id: number, payload: Partial<FonctionPayload>) => api.put(`/fonctions/${id}`, payload)
export const deleteFonction = async (id: number) => api.delete(`/fonctions/${id}`)
export const getFonctionsAgent = async (Id_agent: number) => api.get(`/agents/${Id_agent}/fonctions`)