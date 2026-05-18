// Types basés sur le MLD SIRH-INSTAT

export type Sexe = 'M' | 'F'
export type Civilite = 'Mr' | 'Mme' | 'Melle'

export type TypeStatut = 'Fonctionnaire' | 'Contractuel' | 'Stagiaire' | 'Vacataire'

export interface Region {
  Id_region: number
  nom_region: string
  Chef_region?: string
}

export interface Direction {
  Id_direction: number
  nom_direction: string
  sigle?: string
  siege?: string
  faritany?: string
}

export interface Service {
  Id_service: number
  nom_service: string
  Id_direction: number
}

export interface Division {
  Id_division: number
  Nom_division: string
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
  Id_agent: number
  num_matricule: string
  nom: string
  prenoms: string
  adresse?: string
  N_CIN?: string
  date_naissance?: string
  sexe?: Sexe
  date_entree_admin?: string
  date_delivrance_CI?: string
  lieu_delivrance_CI?: string
  civilite?: Civilite
  tel?: string
  mail?: string
  porte?: string
  categ_retraite?: string | null
  N_Cnaps?: string | null
  pp_gale?: number
  date_retraite?: string | null
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

export type AgentFormData = Omit<Agent, 'Id_agent' | 'direction' | 'service' | 'division' | 'statut' | 'contrat'> & {
  Id_direction?: number | string
  Id_service?: number | string
  Id_division?: number | string
  Id_statut?: number | string
  Id_contrat?: number | string
}