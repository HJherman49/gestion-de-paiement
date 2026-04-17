import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Briefcase,
  Building2,
  Banknote,
  GraduationCap,
  Baby,
  FileText,
  History,
  Settings
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Agents", path: "/agents", icon: Users },
    { name: "Recrutement", path: "/recrutement", icon: Briefcase },
    { name: "Carrière", path: "/rh", icon: Users },
    { name: "Paie", path: "/paie", icon: Wallet },
    { name: "Référentiels", path: "/referentiels", icon: FileText },
    { name: "Structure", path: "/structure", icon: Building2 },
    { name: "Banque", path: "/banque", icon: Banknote },
    { name: "Formation", path: "/formation", icon: GraduationCap },
    { name: "Famille", path: "/famille", icon: Baby },
    { name: "Historique", path: "/historique", icon: History },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div
      style={{
        width: "260px",
        height: "100vh",
        background: "#0f172a",
        color: "white",
        display: "flex",
        flexDirection: "column",
        boxShadow: "2px 0 10px rgba(0,0,0,0.2)"
      }}
    >
      {/* LOGO */}
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid #334155",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "18px",
          letterSpacing: "1px"
        }}
      >
        🏢 HR SYSTEM
      </div>

      {/* MENU */}
      <div style={{ flex: 1, padding: "10px" }}>
        {menu.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 15px",
                marginBottom: "10px",
                borderRadius: "10px",
                textDecoration: "none",
                color: active ? "#fff" : "#cbd5f5",
                background: active ? "#2563eb" : "transparent",
                transition: "all 0.2s ease",
                position: "relative"
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "#1e293b";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              {/* BARRE ACTIVE GAUCHE */}
              {active && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "20%",
                    height: "60%",
                    width: "4px",
                    background: "#60a5fa",
                    borderRadius: "0 4px 4px 0"
                  }}
                />
              )}

              {/* ICÔNE */}
              <div
                style={{
                  width: "32px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Icon size={18} />
              </div>

              {/* TEXTE */}
              <span
                style={{
                  marginLeft: "12px",
                  whiteSpace: "nowrap",
                  fontSize: "14px",
                  fontWeight: 500
                }}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>

      {/* FOOTER */}
      <div
        style={{
          padding: "12px",
          borderTop: "1px solid #334155",
          textAlign: "center",
          fontSize: "12px",
          color: "#94a3b8"
        }}
      >
        ERP RH v1.0
      </div>
    </div>
  );
}