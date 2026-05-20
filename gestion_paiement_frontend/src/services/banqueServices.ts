import api from './api'

// ── Types ──────────────────────────────────────────────────────────────────

export interface BanqueFromAPI {
  Id_banque:           number
  Nom_banque:          string
  agence:              string
  code_banque:         string
  code_localite_bnq:   string
  comptes_bancaires_count?: number
  created_at?:         string
}

export interface BanquePayload {
  Nom_banque:        string
  agence:            string
  code_banque:       string
  code_localite_bnq: string
}

export interface CompteBancaireFromAPI {
  Id_compte_bancaire: number
  num_compte:         string
  adresse_bnq:     string
  code_localite:      string
  CODQEB:             string
  GUICHB:             string
  RIB:                string
  Id_agent:           number
  Id_banque:          number
  agent?: {
    Id_agent:      number
    nom:           string
    prenoms:       string
    num_matricule: string
    civilite:      string
    direction?: { Sigle: string }
  }
  banque?: {
    Id_banque:  number
    Nom_banque: string
    agence:     string
    code_banque: string
  }
  created_at?: string
}

export interface CompteBancairePayload {
  num_compte:     string
  adresse_bnq: string
  code_localite:  string
  CODQEB:         string
  GUICHB:         string
  RIB:            string
  Id_agent:       number
  Id_banque:      number
}

// ── Banques ────────────────────────────────────────────────────────────────
export const getBanques   = async (params: { page?: number; per_page?: number } = {}) => api.get('/banques', { params })
export const getBanque    = async (id: number) => api.get(`/banques/${id}`)
export const createBanque = async (payload: BanquePayload) => api.post('/banques', payload)
export const updateBanque = async (id: number, payload: Partial<BanquePayload>) => api.put(`/banques/${id}`, payload)
export const deleteBanque = async (id: number) => api.delete(`/banques/${id}`)

// ── Comptes bancaires ──────────────────────────────────────────────────────
export const getComptes        = async (params: { page?: number; per_page?: number; search?: string } = {}) => api.get('/compte-bancaires', { params })
export const getCompte         = async (id: number) => api.get(`/compte-bancaires/${id}`)
export const createCompte      = async (payload: CompteBancairePayload) => api.post('/compte-bancaires', payload)
export const updateCompte      = async (id: number, payload: Partial<CompteBancairePayload>) => api.put(`/compte-bancaires/${id}`, payload)
export const deleteCompte      = async (id: number) => api.delete(`/compte-bancaires/${id}`)
export const getComptesAgent   = async (Id_agent: number) => api.get(`/agents/${Id_agent}/compte-bancaire`)