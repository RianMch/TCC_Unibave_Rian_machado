import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { isAxiosError } from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await login(email, senha);
      navigate("/dashboard");
    } catch (e) {
      if (!isAxiosError(e) || !e.response) {
        setErro("Não foi possível conectar ao servidor.");
      } else if (e.response.status === 429) {
        setErro("Muitas tentativas. Aguarde alguns minutos e tente de novo.");
      } else if (e.response.status === 400 || e.response.status === 401) {
        setErro("E-mail ou senha inválidos.");
      } else {
        setErro("Erro no servidor. Tente novamente em instantes.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1>Entrar</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={carregando}
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
            disabled={carregando}
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>

        {/* Link Esqueci Minha Senha */}
        <div style={{ textAlign: "right", marginBottom: 16 }}>
          <Link 
            to="/esqueceu-senha" 
            style={{ fontSize: "14px", color: "#0F6E56", textDecoration: "none" }}
          >
            Esqueceu a senha?
          </Link>
        </div>

        {erro && (
          <p style={{ color: "red", marginBottom: 12 }}>{erro}</p>
        )}

        <button
          type="submit"
          disabled={carregando}
          style={{
            width: "100%",
            padding: 12,
            background: carregando ? "#ccc" : "#0F6E56",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: carregando ? "not-allowed" : "pointer"
          }}
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <Link to="/">Voltar</Link>
        {" · "}
        <Link to="/register">Criar conta</Link>
      </div>
    </div>
  );
}