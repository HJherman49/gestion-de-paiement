import { getAgents, addAgent, updateAgent, deleteAgent } from "../services/agentService";
import { Agent } from "../models/Agent";

export const fetchAgents = () => getAgents();

export const createAgent = (agent: Agent) => addAgent(agent);

export const editAgent = (agent: Agent) => updateAgent(agent);

export const removeAgent = (id: number) => deleteAgent(id);