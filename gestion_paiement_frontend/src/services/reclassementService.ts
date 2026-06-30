import api from './api'

export interface ReclassementFromAPI {
  Id_reclass:      number
  date_reclassement:    string
  categ_reclassement:   string
  ancienne_categorie?:  string | null
  date_effet_solde:     string
  date_effet_anciennete: string
  observation:          string
  Id_carriere:          number
  valide_le?:           string | null
  carriere?: {
    Id_carriere: number
    grade:       string
    classe:      string
    echelon:     string
    Categorie:   string
    indice:      number
    agent?: {
      Id_agent:      number
      nom:           string
      prenoms:       string
      num_matricule: string
      civilite:      string
    }
  }
  created_at?: string
}

export interface ReclassementPayload {
  date_reclassement:     string
  categ_reclassement:    string
  date_effet_solde:      string
  date_effet_anciennete: string
  observation?:          string
  Id_carriere:           number
}

export const getReclassements   = async (params: { page?: number; per_page?: number; search?: string } = {}) =>
  api.get('/reclassements', { params })

export const getReclassement    = async (id: number) => api.get(`/reclassements/${id}`)
export const createReclassement = async (payload: ReclassementPayload) => api.post('/reclassements', payload)
export const updateReclassement = async (id: number, payload: Partial<ReclassementPayload>) => api.put(`/reclassements/${id}`, payload)
export const deleteReclassement = async (id: number) => api.delete(`/reclassements/${id}`)
export const getCarrieres       = async () => api.get('/carrieres', { params: { per_page: 300 } })

/**
 * Valide un reclassement : applique la nouvelle catégorie à la carrière
 * liée et marque le reclassement comme définitif (valide_le rempli).
 * Ne peut être appelé qu'une seule fois — le backend refuse une 2e validation.
 */
export const validerReclassement = async (id: number) =>
  api.post(`/reclassements/${id}/valider`)