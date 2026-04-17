import { useState } from "react";
import { addAgent } from "../services/agentService";
import { useNavigate } from "react-router-dom";
import type { Agent } from "../models/Agent";

export default function AgentCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState<Agent>({
    id: 0,
    matricule: "",
    nom: "",
    prenom: "",
    cin: "",
    adresse: "",
    sexe: "M",
    telephone: "",
    civilite: "Mr",
    dateEntree: "",
    direction: "",
    service: "",
    division: "",
    statut: "",
    contrat: "",
    salaire: 0,
    actif: true
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: name === "salaire" ? Number(value) : value
    });
  };

  const handleSubmit = () => {
    if (!form.nom || !form.matricule) {
      alert("Champs obligatoires !");
      return;
    }

    const newAgent: Agent = {
      ...form,
      id: Date.now()
    };

    addAgent(newAgent);
    navigate("/agents");
  };

  return (
    <div style={pageStyle}>
      
      {/* HEADER */}
      <div style={headerStyle}>
        <button onClick={() => navigate(-1)} style={backBtn}>
          ← Retour
        </button>
        <h1>➕ Création Agent</h1>
      </div>

      {/* 👤 INFOS */}
      <div style={card}>
        <h3 style={sectionTitle}>👤 Informations personnelles</h3>

        <div style={grid}>
          <Input name="matricule" label="Matricule *" placeholder="AG2024001" onChange={handleChange} />
          <Input name="nom" label="Nom *" onChange={handleChange} />
          <Input name="prenom" label="Prénom" onChange={handleChange} />
          <Input name="cin" label="CIN" onChange={handleChange} />
          <Input name="telephone" label="Téléphone" placeholder="034XXXXXXX" onChange={handleChange} />
          <Input name="adresse" label="Adresse" onChange={handleChange} />
        </div>

        <div style={grid}>
          <Select name="sexe" label="Sexe" options={["M", "F"]} onChange={handleChange} />
          <Select name="civilite" label="Civilité" options={["Mr", "Mme", "Mlle"]} onChange={handleChange} />
          <Input type="date" name="dateEntree" label="Date entrée" onChange={handleChange} />
        </div>
      </div>

      {/* 🏢 ORGANISATION */}
      <div style={card}>
        <h3 style={sectionTitle}>🏢 Organisation</h3>

        <div style={grid}>
          <Input name="direction" label="Direction" placeholder="Finance" onChange={handleChange} />
          <Input name="service" label="Service" placeholder="Comptabilité" onChange={handleChange} />
          <Input name="division" label="Division" placeholder="Budget" onChange={handleChange} />
        </div>
      </div>

      {/* 📄 RH */}
      <div style={card}>
        <h3 style={sectionTitle}>📄 Ressources humaines</h3>

        <div style={grid}>
          <Select name="statut" label="Statut *" options={["Fonctionnaire", "Contractuel", "Stagiaire"]} onChange={handleChange} />
          <Select name="contrat" label="Contrat *" options={["CDI", "CDD", "Stage"]} onChange={handleChange} />
          <Input type="number" name="salaire" label="Salaire (Ar)" onChange={handleChange} />
        </div>
      </div>

      {/* ACTIONS */}
      <div style={actions}>
        <button style={cancelBtn} onClick={() => navigate("/agents")}>
          Annuler
        </button>

        <button style={saveBtn} onClick={handleSubmit}>
          Enregistrer
        </button>
      </div>
    </div>
  );
}

/* 🔧 COMPONENTS */

function Input({ label, ...props }: any) {
  return (
    <div style={field}>
      <label style={labelStyle}>{label}</label>
      <input {...props} style={inputStyle} />
    </div>
  );
}

function Select({ label, options, ...props }: any) {
  return (
    <div style={field}>
      <label style={labelStyle}>{label}</label>
      <select {...props} style={inputStyle}>
        <option value="">-- choisir --</option>
        {options.map((o: string) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

/* 🎨 STYLES PRO */

const pageStyle = {
  padding: "40px",
  background: "#f1f5f9",
  minHeight: "100vh"
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "20px",
  marginBottom: "20px"
};

const backBtn = {
  padding: "8px 12px",
  background: "#e2e8f0",
  border: "none",
  borderRadius: "6px"
};

const card = {
  background: "#fff",
  padding: "25px",
  borderRadius: "14px",
  marginBottom: "25px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
};

const sectionTitle = {
  marginBottom: "20px",
  color: "#475569",
  fontSize: "14px",
  textTransform: "uppercase",
  letterSpacing: "1px"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "25px",
  marginBottom: "15px"
};

const field = {
  display: "flex",
  flexDirection: "column" as const
};

const labelStyle = {
  marginBottom: "6px",
  fontSize: "13px",
  fontWeight: 500
};

const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "14px"
};

const actions = {
  display: "flex",
  gap: "15px",
  marginTop: "10px"
};

const saveBtn = {
  background: "#2563eb",
  color: "#fff",
  padding: "12px 25px",
  border: "none",
  borderRadius: "8px"
};

const cancelBtn = {
  background: "#e2e8f0",
  padding: "12px 25px",
  border: "none",
  borderRadius: "8px"
};