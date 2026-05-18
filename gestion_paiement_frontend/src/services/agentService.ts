import api from '../axios' // votre fichier axios existant

// -------------------------------------------------------
// GET /api/v1/agents
// -------------------------------------------------------
export const getAgents = async (filters: {
  search?: string
  Id_direction?: number
  Id_service?: number
  Id_statut?: number
  page?: number
  per_page?: number
} = {}) => {
  const params: Record<string, string | number> = {}
  if (filters.search)       params.search       = filters.search
  if (filters.Id_direction) params.Id_direction = filters.Id_direction
  if (filters.Id_service)   params.Id_service   = filters.Id_service
  if (filters.Id_statut)    params.Id_statut    = filters.Id_statut
  if (filters.page)         params.page         = filters.page
  if (filters.per_page)     params.per_page     = filters.per_page

  return api.get('/agents', { params })
}

// -------------------------------------------------------
// GET /api/v1/agents/{id}
// -------------------------------------------------------
export const getAgent = async (id: number) => {
  return api.get(`/agents/${id}`)
}

// -------------------------------------------------------
// POST /api/v1/agents
// -------------------------------------------------------
export const createAgent = async (payload: Record<string, any>) => {
  return api.post('/agents', payload)
}

// -------------------------------------------------------
// PUT /api/v1/agents/{id}
// -------------------------------------------------------
export const updateAgent = async (id: number, payload: Record<string, any>) => {
  return api.put(`/agents/${id}`, payload)
}

// -------------------------------------------------------
// DELETE /api/v1/agents/{id}
// -------------------------------------------------------
export const deleteAgent = async (id: number) => {
  return api.delete(`/agents/${id}`)
}

// -------------------------------------------------------
// Référentiels
// -------------------------------------------------------
export const getStatuts    = async () => api.get('/statuts')
export const getDirections = async () => api.get('/directions')
export const getServices   = async () => api.get('/services')
export const getDivisions  = async () => api.get('/divisions')
export const getContrats   = async () => api.get('/contrats')