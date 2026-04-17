import { Routes, Route } from "react-router-dom";

import MainLayout from "./views/layouts/MainLayout";

import Dashboard from "./views/Dashboard";
import Agents from "./views/Agents";
import Paie from "./views/Paie";
import Recrutement from "./views/Recrutement";
import RH from "./views/RH";
import Structure from "./views/Structure";
import Banque from "./views/Banque";
import Formation from "./views/Formation";
import Famille from "./views/Famille";
import Referentiels from "./views/Referentiels";
import Historique from "./views/Historique";
import Settings from "./views/Settings";

// 👇 AJOUT IMPORTANT
import AgentCreate from "./views/AgentCreate";
import AgentDetail from "./views/AgentDetail";

export default function App() {
  return (
    <Routes>

      {/* 🔥 LAYOUT PRINCIPAL */}
      <Route element={<MainLayout />}>

        <Route path="/" element={<Dashboard />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/agents/create" element={<AgentCreate />} />
        <Route path="/agents/:id" element={<AgentDetail />} />

        <Route path="/paie" element={<Paie />} />
        <Route path="/recrutement" element={<Recrutement />} />
        <Route path="/rh" element={<RH />} />
        <Route path="/structure" element={<Structure />} />
        <Route path="/banque" element={<Banque />} />
        <Route path="/formation" element={<Formation />} />
        <Route path="/famille" element={<Famille />} />
        <Route path="/referentiels" element={<Referentiels />} />
        <Route path="/historique" element={<Historique />} />
        <Route path="/settings" element={<Settings />} />

      </Route>

    </Routes>
  );
}