import { useState } from "react";
import type { CSSProperties } from "react";

export default function Preembauche() {
  const [agent, setAgent] = useState("Jean Paul RAKOTO");

  const [contractType, setContractType] = useState("CDD");
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-12-31");

  const [salary, setSalary] = useState(500000);

  const days =
    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
    (1000 * 3600 * 24);

  const net = salary - salary * 0.2;

  return (
    <div style={page}>

      {/* STEPPER */}
      <div style={stepper}>
        <Step label="Sélection" active={false} />
        <Step label="Préembauche" active />
        <Step label="Validation" />
        <Step label="Titularisation" />
      </div>

      {/* HEADER AGENT */}
      <div style={agentCard}>
        <div style={avatar}>JP</div>

        <div>
          <div style={name}>{agent}</div>
          <div style={sub}>Matricule: AG-2026-001 • Direction RH</div>
        </div>

        <button style={switchBtn}>Changer agent</button>
      </div>

      {/* GRID */}
      <div style={grid}>

        {/* CONTRAT */}
        <div style={card}>
          <h3 style={title}>Contrat</h3>

          <input style={input} placeholder="Type contrat" value={contractType} onChange={e => setContractType(e.target.value)} />
          <input style={input} placeholder="Date début" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <input style={input} placeholder="Date fin" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />

          <div style={info}>
            Durée: <b>{isNaN(days) ? 0 : Math.round(days)} jours</b>
          </div>
        </div>

        {/* STAGE */}
        <div style={card}>
          <h3 style={title}>Stage</h3>

          <input style={input} placeholder="Poste" />
          <input style={input} placeholder="Grade" />

          <div style={info}>
            Titularisation prévue: <b>{endDate}</b>
          </div>
        </div>

        {/* SALAIRE */}
        <div style={card}>
          <h3 style={title}>Rémunération</h3>

          <input
            style={input}
            type="number"
            value={salary}
            onChange={e => setSalary(Number(e.target.value))}
            placeholder="Salaire de base"
          />

          <div style={moneyBox}>
            <div>Brut: {salary.toLocaleString()} Ar</div>
            <div>Net estimé: {net.toLocaleString()} Ar</div>
            <div>Coût employeur: {(salary * 1.25).toLocaleString()} Ar</div>
          </div>
        </div>

        {/* DOCUMENTS */}
        <div style={card}>
          <h3 style={title}>Documents</h3>

          <Check label="Contrat signé" />
          <Check label="CIN" />
          <Check label="Diplôme" />
          <Check label="Certificat médical" optional />
        </div>

      </div>

      {/* FOOTER ACTIONS */}
      <div style={footer}>
        <button style={ghostBtn}>Enregistrer brouillon</button>
        <button style={primaryBtn}>Valider le dossier</button>
      </div>

    </div>
  );
}

/* ================= COMPONENTS ================= */

function Step({ label, active }: { label: string; active?: boolean }) {
  return (
    <div style={{ ...step, color: active ? "#534AB7" : "#94a3b8" }}>
      <div style={{ ...dot, background: active ? "#534AB7" : "#e2e8f0" }} />
      {label}
    </div>
  );
}

function Check({ label, optional }: { label: string; optional?: boolean }) {
  return (
    <div style={checkRow}>
      <input type="checkbox" />
      <span>
        {label} {optional && <small style={{ color: "#94a3b8" }}>(optionnel)</small>}
      </span>
    </div>
  );
}

/* ================= STYLES ================= */

const page: CSSProperties = {
  padding: 30,
  background: "#f5f6fa",
  minHeight: "100vh",
  fontFamily: "sans-serif"
};

const stepper: CSSProperties = {
  display: "flex",
  gap: 20,
  marginBottom: 20
};

const step: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 13
};

const dot: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: "50%"
};

const agentCard: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  background: "#fff",
  padding: 15,
  borderRadius: 12,
  marginBottom: 20
};

const avatar: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  background: "#534AB7",
  color: "#fff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: 600
};

const name: CSSProperties = { fontWeight: 600 };
const sub: CSSProperties = { fontSize: 12, color: "#64748b" };

const switchBtn: CSSProperties = {
  marginLeft: "auto",
  background: "#e2e8f0",
  border: "none",
  padding: "8px 12px",
  borderRadius: 8
};

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 15
};

const card: CSSProperties = {
  background: "#fff",
  padding: 15,
  borderRadius: 12
};

const title: CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 10
};

const input: CSSProperties = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  marginBottom: 10
};

const info: CSSProperties = {
  fontSize: 13,
  color: "#64748b",
  marginTop: 5
};

const moneyBox: CSSProperties = {
  marginTop: 10,
  fontSize: 13,
  display: "flex",
  flexDirection: "column",
  gap: 5
};

const checkRow: CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  marginBottom: 8
};

const footer: CSSProperties = {
  marginTop: 20,
  display: "flex",
  justifyContent: "flex-end",
  gap: 10
};

const ghostBtn: CSSProperties = {
  padding: "10px 15px",
  border: "1px solid #ccc",
  background: "#fff",
  borderRadius: 8
};

const primaryBtn: CSSProperties = {
  padding: "10px 15px",
  border: "none",
  background: "#534AB7",
  color: "#fff",
  borderRadius: 8
};