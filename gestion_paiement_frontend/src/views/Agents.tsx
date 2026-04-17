import { useState } from "react";
import { Link } from "react-router-dom";
import type { CSSProperties } from "react";

/* 🔥 DATA TEST */
const agentsData = [
  {
    matricule: "AG-2024-001",
    civilite: "Monsieur",
    nom: "RAKOTO",
    prenoms: "Jean Paul",
    tel: "+261 34 12 345 67",
    cin: "101 234 567 890",
    direction: "Direction Générale",
    service: "Paie et Personnel",
    statut: "Titulaire",
    contrat: "CDI"
  },
  {
    matricule: "AG-2024-002",
    civilite: "Madame",
    nom: "RAVAO",
    prenoms: "Marie Claire",
    tel: "+261 34 23 456 78",
    cin: "101 234 567 891",
    direction: "Direction Administrative",
    service: "Comptabilité",
    statut: "Contractuel",
    contrat: "CDD"
  },
  {
    matricule: "AG-2024-003",
    civilite: "Monsieur",
    nom: "ANDRIA",
    prenoms: "Tsiry Hery",
    tel: "+261 34 34 567 89",
    cin: "101 234 567 892",
    direction: "Direction Technique",
    service: "Informatique",
    statut: "Titulaire",
    contrat: "CDI"
  }
];

export default function Agents() {
  const [search, setSearch] = useState("");
  const [direction, setDirection] = useState("");
  const [statut, setStatut] = useState("");

  /* 📄 PAGINATION */
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  /* 🔍 FILTER */
  const filtered = agentsData.filter((a) => {
    const text = `${a.nom ?? ""} ${a.prenoms ?? ""} ${a.matricule ?? ""}`.toLowerCase();

    return (
      text.includes(search.toLowerCase()) &&
      (direction ? a.direction === direction : true) &&
      (statut ? a.statut === statut : true)
    );
  });

  /* 📄 PAGINATION SAFE */
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const paginated = filtered.slice(start, end);

  const goToPage = (p: number) => {
    setCurrentPage(Math.max(1, Math.min(p, totalPages)));
  };

  return (
    <div style={pageStyle}>

      {/* HEADER */}
      <div style={header}>
        <div>
          <h1 style={title}>Gestion des agents</h1>
          <p style={subtitle}>
            Gérer et suivre tous les agents de l'organisation
          </p>
        </div>

        <div style={actionsHeader}>
          <button style={btnPrimary}>⬇ Exporter</button>

          <Link to="/agents/create" style={{ textDecoration: "none" }}>
            <button style={btnPrimary}>＋ Ajouter un agent</button>
          </Link>
        </div>
      </div>

      {/* FILTER */}
      <div style={card}>
        <div style={filterRow}>
          <input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            style={input}
          />

          <select
            value={direction}
            onChange={(e) => {
              setDirection(e.target.value);
              setCurrentPage(1);
            }}
            style={input}
          >
            <option value="">Toutes directions</option>
            <option>Direction Générale</option>
            <option>Direction Administrative</option>
            <option>Direction Technique</option>
          </select>

          <select
            value={statut}
            onChange={(e) => {
              setStatut(e.target.value);
              setCurrentPage(1);
            }}
            style={input}
          >
            <option value="">Tous statuts</option>
            <option>Titulaire</option>
            <option>Contractuel</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div style={card}>

        {/* COMPTEUR */}
        <div style={counter}>
          {filtered.length === 0
            ? "0 agent trouvé"
            : `${start + 1}–${Math.min(end, filtered.length)} sur ${filtered.length} agents`}
        </div>

        <table style={table}>
          <thead>
            <tr>
              <th>Matricule</th>
              <th>Identité</th>
              <th>Contact</th>
              <th>Affectation</th>
              <th>Statut</th>
              <th>Contrat</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((a, i) => (
              <tr key={i} style={row}>

                <td style={matricule}>{a.matricule}</td>

                <td>
                  <div style={identity}>
                    <div style={avatar}>
                      {(a.nom?.[0] ?? "A").toUpperCase()}
                    </div>
                    <div>
                      <div style={name}>{a.civilite} {a.nom}</div>
                      <div style={sub}>{a.prenoms}</div>
                    </div>
                  </div>
                </td>

                <td>
                  <div>{a.tel}</div>
                  <div style={sub}>{a.cin}</div>
                </td>

                <td>
                  <div style={{ fontWeight: 600 }}>{a.direction}</div>
                  <div style={sub}>{a.service}</div>
                </td>

                <td>
                  <span style={badge(a.statut)}>{a.statut}</span>
                </td>

                <td>{a.contrat}</td>

                <td>
                  <div style={actions}>
                    <button style={btnIcon}>👁</button>
                    <button style={btnIcon}>✏</button>
                    <button style={btnDelete}>🗑</button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div style={pagination}>
          <button style={btnPage} onClick={() => goToPage(currentPage - 1)}>
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              style={{
                ...btnPage,
                background: currentPage === i + 1 ? "#534AB7" : "#fff",
                color: currentPage === i + 1 ? "#fff" : "#000"
              }}
            >
              {i + 1}
            </button>
          ))}

          <button style={btnPage} onClick={() => goToPage(currentPage + 1)}>
            Next
          </button>
        </div>

      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const pageStyle: CSSProperties = {
  padding: 30,
  background: "#f5f6fa",
  minHeight: "100vh"
};

const header: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20
};

const title: CSSProperties = { fontSize: 26, fontWeight: 600 };
const subtitle: CSSProperties = { color: "#64748b", fontSize: 14 };

const actionsHeader: CSSProperties = { display: "flex", gap: 10 };

const btnPrimary: CSSProperties = {
  background: "#534AB7",
  color: "#fff",
  border: "none",
  padding: "10px 15px",
  borderRadius: 8,
  cursor: "pointer"
};

const card: CSSProperties = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  marginTop: 20
};

const filterRow: CSSProperties = { display: "flex", gap: 10 };

const input: CSSProperties = {
  flex: 1,
  padding: 10,
  borderRadius: 8,
  border: "1px solid #cbd5e1"
};

const table: CSSProperties = { width: "100%", borderCollapse: "collapse" };

const row: CSSProperties = { borderBottom: "1px solid #eee" };

const matricule: CSSProperties = { color: "#534AB7", fontWeight: 600 };

const identity: CSSProperties = { display: "flex", gap: 10, alignItems: "center" };

const avatar: CSSProperties = {
  width: 35,
  height: 35,
  borderRadius: "50%",
  background: "#534AB7",
  color: "#fff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: 600
};

const name: CSSProperties = { fontWeight: 600 };

const sub: CSSProperties = { fontSize: 12, color: "#94a3b8" };

const badge = (s: string): CSSProperties => ({
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 12,
  background: s === "Titulaire" ? "#EEEDFE" : "#DBEAFE"
});

const actions: CSSProperties = { display: "flex", gap: 8 };

const btnIcon: CSSProperties = {
  padding: 5,
  border: "none",
  cursor: "pointer"
};

const btnDelete: CSSProperties = {
  background: "#fee2e2",
  border: "none",
  padding: 5
};

const pagination: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: 8,
  marginTop: 15
};

const btnPage: CSSProperties = {
  padding: "6px 10px",
  border: "1px solid #ccc",
  borderRadius: 6,
  cursor: "pointer"
};

const counter: CSSProperties = {
  marginBottom: 10,
  fontSize: 13,
  color: "#64748b"
};