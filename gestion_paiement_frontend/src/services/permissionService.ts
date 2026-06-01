import api from './api'

export interface UserFromAPI {
  id:         number
  name:       string
  email:      string
  role:       string
  created_at?: string
}

export interface RoleFromAPI {
  id:          number
  name:        string
  permissions: string[]
  users_count: number
}

export interface UserPayload {
  name:     string
  email:    string
  password?: string
  role:     string
}

export interface ProfilPayload {
  name?:             string
  email?:            string
  password_actuel?:  string
  password_nouveau?: string
}

// ── Utilisateurs ───────────────────────────────────────────────────────────
export const getUtilisateurs  = async (params: { page?: number } = {}) => api.get('/utilisateurs', { params })
export const createUtilisateur= async (payload: UserPayload) => api.post('/utilisateurs', payload)
export const updateUtilisateur= async (id: number, payload: Partial<UserPayload>) => api.put(`/utilisateurs/${id}`, payload)
export const deleteUtilisateur= async (id: number) => api.delete(`/utilisateurs/${id}`)

// ── Rôles et permissions ───────────────────────────────────────────────────
export const getRoles       = async () => api.get('/roles')
export const getPermissions = async () => api.get('/permissions')

// ── Profil de l'utilisateur connecté ─────────────────────────────────────
export const getMe          = async () => api.get('/utilisateurs/me')
export const updateProfil   = async (payload: ProfilPayload) => api.post('/utilisateurs/me/profil', payload)

// ── Libellés lisibles des modules ─────────────────────────────────────────
export const MODULE_LABELS: Record<string, string> = {
  agents:            'Agents',
  carrieres:         'Carrières',
  paies:             'Paies',
  reclassements:     'Reclassements',
  fonctions:         'Fonctions',
  preembauches:      'Préembauches',
  enfants:           'Enfants',
  banques:           'Banques',
  comptes_bancaires: 'Comptes bancaires',
  baremes:           'Barèmes',
  directions:        'Directions',
  services:          'Services',
  divisions:         'Divisions',
  historique:        'Historique',
  utilisateurs:      'Utilisateurs',
  parametres:        'Paramètres',
}

export const ACTION_LABELS: Record<string, string> = {
  voir:      'Voir',
  creer:     'Créer',
  modifier:  'Modifier',
  supprimer: 'Supprimer',
  valider:   'Valider',
}

export const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  'Administrateur':    { bg: '#1a1f3c18', color: '#1a1f3c' },
  'Gestionnaire RH':   { bg: '#1a4d8c18', color: '#1a4d8c' },
  'Gestionnaire Paie': { bg: '#27ae6018', color: '#27ae60' },
  'Consultant':        { bg: '#8c6d1a18', color: '#8c6d1a' },
  'Agent':             { bg: '#2980b918', color: '#2980b9' },
  'Auditeur':          { bg: '#c0392b18', color: '#c0392b' },
}