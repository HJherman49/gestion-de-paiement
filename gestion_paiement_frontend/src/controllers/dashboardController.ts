import { getAgents } from "../services/agentService";

export const getDashboardData = () => {
  const agents = getAgents();

  const totalAgents = agents.length;
  const actifs = agents.filter(a => a.actif).length;
  const inactifs = agents.filter(a => !a.actif).length;
  const totalPaie = agents.reduce((sum, a) => sum + a.salaire, 0);

  return {
    totalAgents,
    actifs,
    inactifs,
    totalPaie,
  };
};