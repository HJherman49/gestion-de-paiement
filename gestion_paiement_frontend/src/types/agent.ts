// Types basés sur le MLD SIRH-INSTAT

export type Sexe = 'M' | 'F'
export type Civilite = 'M.' | 'Mme' | 'Mlle'
export type TypeStatut = 'Fonctionnaire' | 'Contractuel' | 'Stagiaire' | 'Vacataire'

export interface Region {
  Id_region: number
  nom_region: string
  Chef_region?: string
}

export interface Direction {
  Id_Direction: number
  Nom_Direction: string
  Sigle?: string
  Siege?: string
  Faritany?: string
}

export interface Service {
  Id_service: number
  Nom_service: string
  Id_direction: number
}

export interface Division {
  Id_division: number
  nom_division: string
  section?: string
  Id_service: number
}

export interface Statut {
  Id_statut: number
  type_statut: TypeStatut
}

export interface Contrat {
  Id_contrat: number
  type_contrat: string
  duree?: string
}

export interface Agent {
  id_agents: number
  num_matricule: string
  nom: string
  prenoms: string
  adresse?: string
  N_CIN?: string
  date_de_naissance?: string
  sexe?: Sexe
  date_entree_admin?: string
  date_delivrance_CI?: string
  lieu_delivrance_CI?: string
  civilite?: Civilite
  tel?: string
  porte?: string
  // FK
  Id_direction?: number
  Id_service?: number
  Id_division?: number
  Id_statut?: number
  Id_contrat?: number
  // Relations peuplées
  direction?: Direction
  service?: Service
  division?: Division
  statut?: Statut
  contrat?: Contrat
}

export type AgentFormData = Omit<Agent, 'id_agents' | 'direction' | 'service' | 'division' | 'statut' | 'contrat'>