import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(email, senha);
      navigate("/dashboard");
    } catch {
      setErro("Email ou senha inválidos");
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", fontFamily: "sans-serif" }}>
      <h1>Entrar</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>

        {erro && (
          <p style={{ color: "red", marginBottom: 12 }}>{erro}</p>
        )}

        <button
          type="submit"
          style={{ width: "100%", padding: 12, background: "#0F6E56", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          Entrar
        </button>
      </form>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <a href="/">Voltar</a>
        {" · "}
        <a href="/register">Criar conta</a>
      </div>
    </div>
  );
}