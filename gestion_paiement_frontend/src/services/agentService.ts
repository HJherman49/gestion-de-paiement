import type { Agent } from "../models/Agent";

let agents: Agent[] = [
  {
    id: 1,
    matricule: "AG-2024-001",
    civilite: "Monsieur",
    nom: "RAKOTO",
    prenoms: "Jean Paul",
    cin: "101 234 567 890",
    adresse: "",
    sexe: "M",
    telephone: "+261 34 12 345 67",
    dateEntree: "",
    direction: "Direction Générale",
    service: "Paie et Personnel",
    division: "",
    statut: "Titulaire",
    contrat: "CDI",
    salaire: 2000,
    actif: true
  },
  {
    id: 2,
    matricule: "AG-2024-002",
    civilite: "Madame",
    nom: "RAVAO",
    prenoms: "Marie Claire",
    cin: "101 234 567 891",
    adresse: "",
    sexe: "F",
    telephone: "+261 34 23 456 78",
    dateEntree: "",
    direction: "Direction Administrative",
    service: "Comptabilité",
    division: "",
    statut: "Contractuel",
    contrat: "CDD",
    salaire: 2500,
    actif: true
  },
  {
    id: 3,
    matricule: "AG-2024-003",
    civilite: "Monsieur",
    nom: "ANDRIA",
    prenoms: "Tsiry Hery",
    cin: "101 234 567 892",
    adresse: "",
    sexe: "M",
    telephone: "+261 34 34 567 89",
    dateEntree: "",
    direction: "Direction Technique",
    service: "Informatique",
    division: "",
    statut: "Titulaire",
    contrat: "CDI",
    salaire: 3000,
    actif: true
  }
];

export const getAgents = () => agents;

export const addAgent = (agent: Agent) => {
  agents.push(agent);
};

export const updateAgent = (updated: Agent) => {
  agents = agents.map(a => (a.id === updated.id ? updated : a));
};

export const deleteAgent = (id: number) => {
  agents = agents.filter(a => a.id !== id);
};