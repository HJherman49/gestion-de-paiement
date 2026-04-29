export interface Agent {
  id: number
  nom: string
  prenom: string
  statut: 'Fonctionnaire' | 'Contractuel' | 'Stagiaire' | 'Vacataire'
  service: string
  salaire: number
}

export interface EvolutionData {
  mois: string
  effectifs: number
  recrutements: number
  masseAriary: number
}

export const agents: Agent[] = [
  { id: 1, nom: 'RAKOTO', prenom: 'Jean', statut: 'Fonctionnaire', service: 'DSI', salaire: 1800000 },
  { id: 2, nom: 'RABE', prenom: 'Marie', statut: 'Contractuel', service: 'DRH', salaire: 1200000 },
  { id: 3, nom: 'ANDRIANTSOA', prenom: 'Paul', statut: 'Stagiaire', service: 'Finance', salaire: 500000 },
  { id: 4, nom: 'RASOA', prenom: 'Hanta', statut: 'Fonctionnaire', service: 'DG', salaire: 2200000 },
  { id: 5, nom: 'RAKOTONDRABE', prenom: 'Luc', statut: 'Vacataire', service: 'Statistique', salaire: 800000 },
]

export const evolutionData: EvolutionData[] = [
  { mois: 'Jan', effectifs: 138, recrutements: 2, masseAriary: 290 },
  { mois: 'Fév', effectifs: 141, recrutements: 3, masseAriary: 295 },
  { mois: 'Mar', effectifs: 145, recrutements: 4, masseAriary: 298 },
  { mois: 'Avr', effectifs: 148, recrutements: 2, masseAriary: 300 },
  { mois: 'Mai', effectifs: 152, recrutements: 5, masseAriary: 303 },
  { mois: 'Juin', effectifs: 155, recrutements: 3, masseAriary: 305 },
  { mois: 'Juil', effectifs: 158, recrutements: 4, masseAriary: 307 },
  { mois: 'Août', effectifs: 161, recrutements: 2, masseAriary: 308 },
  { mois: 'Sep', effectifs: 164, recrutements: 6, masseAriary: 310 },
  { mois: 'Oct', effectifs: 167, recrutements: 4, masseAriary: 312 },
  { mois: 'Nov', effectifs: 170, recrutements: 3, masseAriary: 313 },
  { mois: 'Déc', effectifs: 172, recrutements: 14, masseAriary: 315 },
]

export const repartitionStatut = [
  { name: 'Fonctionnaire', value: 98, color: '#1a1f3c' },
  { name: 'Contractuel', value: 42, color: '#27ae60' },
  { name: 'Stagiaire', value: 20, color: '#f39c12' },
  { name: 'Vacataire', value: 12, color: '#c0392b' },
]

export const recrutements = [
  { poste: 'Statisticien Senior', service: 'DISE', candidats: 24, statut: 'En cours' },
  { poste: 'Développeur Web', service: 'DSI', candidats: 18, statut: 'Entretiens' },
  { poste: 'Comptable', service: 'Finance', candidats: 31, statut: 'En cours' },
  { poste: 'Chargé RH', service: 'DRH', candidats: 12, statut: 'Sélection' },
  { poste: 'Analyste Données', service: 'DISE', candidats: 9, statut: 'En cours' },
]