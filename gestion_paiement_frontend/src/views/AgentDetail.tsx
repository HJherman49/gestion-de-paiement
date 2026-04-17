import { useParams } from "react-router-dom";
import { getAgents } from "../services/agentService";
import { useState } from "react";

export default function AgentDetail() {
  const { id } = useParams();
  const agent = getAgents().find(a => a.id === Number(id));

  const [tab, setTab] = useState("infos");

  if (!agent) {
    return (
      <div style={{ padding: 30 }}>
        <h2>❌ Agent introuvable</h2>
      </div>
    );
  }

  const Tab = ({ label, value }: any) => (
    <button
      onClick={() => setTab(value)}
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid #e2e8f0",
        background: tab === value ? "#2563eb" : "white",
        color: tab === value ? "white" : "#334155",
        fontWeight: 500,
        cursor: "pointer"
      }}
    >
      {label}
    </button>
  );

  const Card = ({ title, value }: any) => (
    <div
      style={{
        background: "white",
        borderRadius: 14,
        padding: 15,
        border: "1px solid #f1f5f9",
        boxShadow: "0 1px 5px rgba(0,0,0,0.04)"
      }}
    >
      <p style={{ fontSize: 12, color: "#64748b" }}>{title}</p>
      <h3 style={{ marginTop: 6 }}>{value}</h3>
    </div>
  );

  return (
    <div style={{ padding: 25, background: "#f1f5f9", minHeight: "100vh" }}>

      {/* 🔥 HEADER PRO PROFILE */}
      <div
        style={{
          background: "white",
          padding: 25,
          borderRadius: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
        }}
      >
        <div style={{ display: "flex", gap: 15, alignItems: "center" }}>

          {/* AVATAR */}
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "#2563eb",
              color: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 20,
              fontWeight: "bold"
            }}
          >
            {agent.nom?.charAt(0)}{agent.prenom?.charAt(0)}
          </div>

          <div>
            <h2 style={{ margin: 0 }}>
              {agent.nom} {agent.prenom}
            </h2>
            <p style={{ margin: 0, color: "#64748b" }}>
              Matricule: {agent.matricule}
            </p>
          </div>
        </div>

        {/* STATUS BADGE */}
        <span
          style={{
            padding: "6px 14px",
            borderRadius: 20,
            background: agent.actif ? "#22c55e" : "#ef4444",
            color: "white",
            fontSize: 12,
            fontWeight: 500
          }}
        >
          {agent.actif ? "Actif" : "Inactif"}
        </span>
      </div>

      {/* 🔥 BODY GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>

        {/* LEFT PANEL */}
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>

          <Card title="📞 Téléphone" value={agent.telephone} />
          <Card title="🪪 CIN" value={agent.cin} />
          <Card title="🏢 Direction" value={agent.direction} />
          <Card title="🏬 Service" value={agent.service} />
          <Card title="📍 Division" value={agent.division} />
          <Card title="💰 Salaire" value={(agent.salaire || 0) + " Ar"} />
        </div>

        {/* RIGHT PANEL */}
        <div>

          {/* 🔥 TABS */}
          <div style={{ display: "flex", gap: 10, marginBottom: 15, flexWrap: "wrap" }}>
            <Tab label="👤 Infos" value="infos" />
            <Tab label="🏢 Organisation" value="org" />
            <Tab label="📄 RH" value="rh" />
            <Tab label="💰 Paie" value="paie" />
            <Tab label="👶 Famille" value="famille" />
            <Tab label="🎓 Formation" value="formation" />
            <Tab label="📈 Carrière" value="carriere" />
          </div>

          {/* CONTENT */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
            }}
          >

            {/* INFOS */}
            {tab === "infos" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 15 }}>
                <Card title="Nom" value={agent.nom} />
                <Card title="Prénom" value={agent.prenom} />
                <Card title="Sexe" value={agent.sexe} />
                <Card title="Adresse" value={agent.adresse} />
                <Card title="Civilité" value={agent.civilite} />
                <Card title="Téléphone" value={agent.telephone} />
              </div>
            )}

            {/* ORG */}
            {tab === "org" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 15 }}>
                <Card title="Direction" value={agent.direction} />
                <Card title="Service" value={agent.service} />
                <Card title="Division" value={agent.division} />
              </div>
            )}

            {/* RH */}
            {tab === "rh" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 15 }}>
                <Card title="Statut" value={agent.statut} />
                <Card title="Contrat" value={agent.contrat} />
                <Card title="Date entrée" value={agent.dateEntree} />
              </div>
            )}

            {/* PAIE */}
            {tab === "paie" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 15 }}>
                <Card title="Salaire brut" value={(agent.salaire || 0) + " Ar"} />
                <Card title="Primes" value="-" />
              </div>
            )}

            {/* AUTRES */}
            {tab === "famille" && <p>👶 Module famille vide (backend futur)</p>}
            {tab === "formation" && <p>🎓 Module formation vide</p>}
            {tab === "carriere" && <p>📈 Timeline carrière à venir</p>}

          </div>
        </div>
      </div>
    </div>
  );
}