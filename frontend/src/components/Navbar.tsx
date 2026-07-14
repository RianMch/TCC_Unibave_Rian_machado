import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <nav style={{
      background: "white",
      borderBottom: "1px solid #e5e7eb",
      padding: "0 24px",
      height: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <div
        onClick={() => navigate("/")}
        style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
      >
        <div style={{
          width: 32, height: 32, background: "#0F6E56",
          borderRadius: 8, display: "flex", alignItems: "center",
          justifyContent: "center", color: "white", fontSize: 16,
        }}>🛡</div>
        <span style={{ fontWeight: 600, fontSize: 16, color: "#0F6E56" }}>RedeSegura</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {usuario ? (
          <>
            <button
              onClick={() => navigate("/dashboard")}
              style={{ background: "none", color: "#374151", padding: "6px 12px", border: "1px solid #e5e7eb", borderRadius: 8 }}
            >
              Meus pedidos
            </button>
            {usuario.role === "ADMIN" && (
              <button
                onClick={() => navigate("/admin")}
                style={{ background: "none", color: "#374151", padding: "6px 12px", border: "1px solid #e5e7eb", borderRadius: 8 }}
              >
                Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              style={{ background: "#f3f4f6", color: "#374151", padding: "6px 12px", borderRadius: 8 }}
            >
              Sair
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/login")}
              style={{ background: "none", color: "#374151", padding: "6px 12px", border: "1px solid #e5e7eb", borderRadius: 8 }}
            >
              Entrar
            </button>
            <button
              onClick={() => navigate("/register")}
              style={{ background: "#0F6E56", color: "white", padding: "6px 16px", borderRadius: 8 }}
            >
              Criar conta
            </button>
          </>
        )}
      </div>
    </nav>
  );
}