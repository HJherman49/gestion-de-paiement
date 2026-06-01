// ============================================================
// SIRH-INSTAT — Système de Notifications
// ============================================================

export type NotifCategorie =
  | 'agent'
  | 'affectation'
  | 'promotion'
  | 'contrat'
  | 'retraite'
  | 'paie'
  | 'audit'
  | 'famille'
  | 'diplome'

export type NotifPriorite = 'haute' | 'moyenne' | 'info'

export interface Notification {
  id: number
  titre: string
  message: string
  categorie: NotifCategorie
  priorite: NotifPriorite
  date: string       // ISO string
  lue: boolean
  agent_matricule?: string
  agent_nom?: string
}

// ── Config catégories ──────────────────────────────────────────────────────

export const NOTIF_CATEGORIES: Record<NotifCategorie, {
  label: string
  emoji: string
  color: string
  bg: string
}> = {
  agent:      { label: 'Agents',      emoji: '👤', color: '#1a1f3c', bg: '#1a1f3c12' },
  affectation:{ label: 'Affectation', emoji: '🔀', color: '#2980b9', bg: '#2980b912' },
  promotion:  { label: 'Promotion',   emoji: '📈', color: '#8e44ad', bg: '#8e44ad12' },
  contrat:    { label: 'Contrats',    emoji: '📄', color: '#e67e22', bg: '#e67e2212' },
  retraite:   { label: 'Retraite',    emoji: '🏖️', color: '#16a085', bg: '#16a08512' },
  paie:       { label: 'Paie',        emoji: '💰', color: '#27ae60', bg: '#27ae6012' },
  audit:      { label: 'Audit',       emoji: '🔒', color: '#c0392b', bg: '#c0392b12' },
  famille:    { label: 'Famille',     emoji: '👶', color: '#d68910', bg: '#d6891012' },
  diplome:    { label: 'Diplômes',    emoji: '🎓', color: '#2980b9', bg: '#2980b912' },
}

export const NOTIF_PRIORITE: Record<NotifPriorite, { color: string; label: string }> = {
  haute:   { color: '#c0392b', label: 'Urgent'  },
  moyenne: { color: '#e67e22', label: 'Moyen'   },
  info:    { color: '#9aa3b5', label: 'Info'    },
}

// ── Données mock ───────────────────────────────────────────────────────────

const now = new Date()
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString()
const hoursAgo = (n: number) => new Date(now.getTime() - n * 3600000).toISOString()

export const NOTIFICATIONS_MOCK: Notification[] = [
  // Agents
  {
    id: 1, titre: 'Nouvel agent ajouté',
    message: 'RAKOTO Jean Pierre (MAT-001) a été enregistré dans le système.',
    categorie: 'agent', priorite: 'info',
    date: hoursAgo(1), lue: false,
    agent_matricule: 'MAT-001', agent_nom: 'RAKOTO Jean Pierre',
  },
  {
    id: 2, titre: 'Matricule créé',
    message: 'Le matricule MAT-006 vient d\'être attribué à RANDRIA Hery.',
    categorie: 'agent', priorite: 'info',
    date: hoursAgo(3), lue: false,
    agent_matricule: 'MAT-006', agent_nom: 'RANDRIA Hery',
  },
  // Affectation
  {
    id: 3, titre: 'Mutation effectuée',
    message: 'RABE Marie Hélène a été affectée à la Direction des Systèmes d\'Information.',
    categorie: 'affectation', priorite: 'moyenne',
    date: hoursAgo(5), lue: false,
    agent_matricule: 'MAT-002', agent_nom: 'RABE Marie Hélène',
  },
  {
    id: 4, titre: 'Changement de service',
    message: 'RASOA Hanta Volatiana mutée vers le Service Paie (DRH).',
    categorie: 'affectation', priorite: 'moyenne',
    date: daysAgo(1), lue: true,
    agent_matricule: 'MAT-004', agent_nom: 'RASOA Hanta',
  },
  // Promotion
  {
    id: 5, titre: 'Promotion validée',
    message: 'RAKOTO Jean — Avancement Classe II → Classe I, Indice 420 → 450.',
    categorie: 'promotion', priorite: 'haute',
    date: daysAgo(1), lue: false,
    agent_matricule: 'MAT-001', agent_nom: 'RAKOTO Jean Pierre',
  },
  {
    id: 6, titre: 'Reclassement effectué',
    message: 'Reclassement catégorie B → A validé pour l\'agent MAT-008.',
    categorie: 'promotion', priorite: 'haute',
    date: daysAgo(2), lue: false,
    agent_matricule: 'MAT-008',
  },
  // Contrats
  {
    id: 7, titre: 'Contrat expire dans 7 jours',
    message: 'Le CDD de RANDRIA Hery (MAT-006) expire le 02/06/2025. Action requise.',
    categorie: 'contrat', priorite: 'haute',
    date: daysAgo(1), lue: false,
    agent_matricule: 'MAT-006', agent_nom: 'RANDRIA Hery',
  },
  {
    id: 8, titre: 'Contrat expire dans 30 jours',
    message: 'Le stage de ANDRIANTSOA Paul (MAT-003) se termine le 01/07/2025.',
    categorie: 'contrat', priorite: 'moyenne',
    date: daysAgo(2), lue: true,
    agent_matricule: 'MAT-003', agent_nom: 'ANDRIANTSOA Paul',
  },
  // Retraite
  {
    id: 9, titre: '3 agents en retraite ce mois',
    message: 'RASOLOFONIRINA, RAKOTOBE et ANDRIANA atteignent l\'âge de retraite en juin 2025.',
    categorie: 'retraite', priorite: 'haute',
    date: daysAgo(2), lue: false,
  },
  {
    id: 10, titre: 'Départ à la retraite proche',
    message: 'RAKOTONDRABE Luc (MAT-005) — retraite prévue dans 3 mois (Août 2025).',
    categorie: 'retraite', priorite: 'moyenne',
    date: daysAgo(3), lue: true,
    agent_matricule: 'MAT-005', agent_nom: 'RAKOTONDRABE Luc',
  },
  // Paie
  {
    id: 11, titre: 'Paie Avril 2025 générée',
    message: '5 fiches de paie générées. Masse salariale nette : 5 315 000 Ar.',
    categorie: 'paie', priorite: 'info',
    date: daysAgo(3), lue: true,
  },
  {
    id: 12, titre: 'Bulletin disponible',
    message: 'Les bulletins de paie du mois d\'Avril sont disponibles pour téléchargement.',
    categorie: 'paie', priorite: 'info',
    date: daysAgo(3), lue: true,
  },
  {
    id: 13, titre: 'Erreur détectée — paie',
    message: 'Anomalie IGR détectée dans la fiche de MAT-004 (Avril 2025). Vérification requise.',
    categorie: 'paie', priorite: 'haute',
    date: daysAgo(4), lue: false,
    agent_matricule: 'MAT-004', agent_nom: 'RASOA Hanta',
  },
  // Audit
  {
    id: 14, titre: 'Coordonnées bancaires modifiées',
    message: 'Les informations bancaires de MAT-010 ont été modifiées (RIB changé).',
    categorie: 'audit', priorite: 'haute',
    date: daysAgo(4), lue: false,
    agent_matricule: 'MAT-010',
  },
  {
    id: 15, titre: 'Suppression de diplôme',
    message: 'Un diplôme a été supprimé du dossier de MAT-003 par l\'admin.',
    categorie: 'audit', priorite: 'moyenne',
    date: daysAgo(5), lue: true,
    agent_matricule: 'MAT-003',
  },
  // Famille
  {
    id: 16, titre: 'Enfant atteint 15 ans',
    message: 'L\'enfant de RASOA Hanta (MAT-004) fête ses 15 ans ce mois. Mise à jour allocations requise.',
    categorie: 'famille', priorite: 'moyenne',
    date: daysAgo(5), lue: false,
    agent_matricule: 'MAT-004', agent_nom: 'RASOA Hanta',
  },
  {
    id: 17, titre: 'Mise à jour allocation familiale',
    message: 'RAKOTO Jean (MAT-001) : naissance déclarée, allocation revue à 70 000 Ar/mois.',
    categorie: 'famille', priorite: 'info',
    date: daysAgo(6), lue: true,
    agent_matricule: 'MAT-001', agent_nom: 'RAKOTO Jean Pierre',
  },
  // Diplômes
  {
    id: 18, titre: 'Nouveau diplôme enregistré',
    message: 'Master en Statistique ajouté au dossier de RABE Marie Hélène (MAT-002).',
    categorie: 'diplome', priorite: 'info',
    date: daysAgo(7), lue: true,
    agent_matricule: 'MAT-002', agent_nom: 'RABE Marie Hélène',
  },
  {
    id: 19, titre: 'Concours réussi enregistré',
    message: 'ANDRIANTSOA Paul (MAT-003) a réussi le concours de la Fonction Publique 2025.',
    categorie: 'diplome', priorite: 'moyenne',
    date: daysAgo(7), lue: false,
    agent_matricule: 'MAT-003', agent_nom: 'ANDRIANTSOA Paul',
  },
]