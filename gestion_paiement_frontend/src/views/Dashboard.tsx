import { getDashboardData } from "../controllers/dashboardController";
import {
  Users,
  UserCheck,
  UserX,
  Wallet,
  Bell,
  User
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function Dashboard() {
  const data = getDashboardData();

  const chartData = [
    { mois: "Jan", paie: 2000 },
    { mois: "Fév", paie: 2500 },
    { mois: "Mar", paie: 2200 },
    { mois: "Avr", paie: 3000 },
    { mois: "Mai", paie: 2800 },
    { mois: "Juin", paie: 3200 },
  ];

  return (
    <div style={{ flex: 1, background: "#f1f5f9" }}>

      {/* 🔥 TOPBAR */}
      <div
        style={{
          background: "#fff",
          padding: "15px 25px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
        }}
      >
        <h2>📊 Dashboard</h2>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Bell />
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <User />
            <span>Admin</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px" }}>

        {/* CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
            marginBottom: "30px"
          }}
        >
          <Card title="Total Agents" value={data.totalAgents} icon={Users} color="#3b82f6" />
          <Card title="Actifs" value={data.actifs} icon={UserCheck} color="#22c55e" />
          <Card title="Inactifs" value={data.inactifs} icon={UserX} color="#ef4444" />
          <Card title="Masse salariale" value={data.totalPaie + " Ar"} icon={Wallet} color="#f59e0b" />
        </div>

        {/* GRAPHIQUE */}
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}
        >
          <h3 style={{ marginBottom: "15px" }}>📈 Evolution des salaires</h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="paie" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
function Card({
  title,
  value,
  icon: Icon,
  color
}: {
  title: string;
  value: any;
  icon: any;
  color: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <div>
        <h4 style={{ color: "#64748b" }}>{title}</h4>
        <h2 style={{ marginTop: "10px" }}>{value}</h2>
      </div>

      <div
        style={{
          background: color,
          padding: "10px",
          borderRadius: "50%",
          color: "#fff"
        }}
      >
        <Icon size={20} />
      </div>
    </div>
  );
}