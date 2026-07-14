import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/auth/register", { nome, email, senha });
      await login(email, senha);
      navigate("/dashboard");
    } catch {
      setErro("Email já cadastrado ou dados inválidos");
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1>Criar conta</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Nome</label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>

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
          Criar conta
        </button>
      </form>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <a href="/">Voltar</a>
        {" · "}
        <a href="/login">Já tenho conta</a>
      </div>
    </div>
  );
}