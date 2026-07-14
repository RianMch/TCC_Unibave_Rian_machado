import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Barra de navegação compartilhada por todas as páginas. Antes, cada
 * página (Home, Dashboard, Admin, Login, Register) montava seu próprio
 * cabeçalho na mão, duplicando os mesmos links e o botão de logout.
 */
export default function Navbar() {
  const { usuario, carregando, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: "1px solid #eee",
        fontFamily: "sans-serif",
      }}
    >
      <Link to="/" style={{ fontWeight: 600, color: "#085041", textDecoration: "none" }}>
        Redes de Proteção
      </Link>

      {/* Enquanto a sessão ainda não foi confirmada (/auth/me em voo),
          não mostra nem os links de visitante nem os de usuário logado —
          evita o link errado piscar na tela por uma fração de segundo. */}
      {!carregando && (
        <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 14 }}>
          {usuario ? (
            <>
              <Link to="/dashboard" style={{ color: "#333", textDecoration: "none" }}>
                Meus pedidos
              </Link>
              {usuario.role === "ADMIN" && (
                <Link to="/admin" style={{ color: "#333", textDecoration: "none" }}>
                  Painel admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                style={{ padding: "6px 14px", background: "#eee", border: "none", borderRadius: 8, cursor: "pointer" }}
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: "#333", textDecoration: "none" }}>
                Entrar
              </Link>
              <Link
                to="/register"
                style={{
                  padding: "6px 14px",
                  background: "#0F6E56",
                  color: "white",
                  borderRadius: 8,
                  textDecoration: "none",
                }}
              >
                Criar conta
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}