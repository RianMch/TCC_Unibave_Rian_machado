import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { isAxiosError } from "axios";

export default function EsqueceuSenha() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setMensagem("");
    setCarregando(true);

    try {
      await api.post("/auth/esqueceu-senha", { email });
      setMensagem("Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.");
      setEmail("");
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 429) {
        setErro("Muitas tentativas. Aguarde um pouco e tente novamente.");
      } else {
        setErro("Não foi possível processar a solicitação. Tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1>Recuperar senha</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Informe o e-mail associado à sua conta e enviaremos as instruções.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={carregando}
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>

        {mensagem && (
          <p style={{ color: "green", marginBottom: 12 }}>{mensagem}</p>
        )}

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
          {carregando ? "Enviando..." : "Enviar link de recuperação"}
        </button>
      </form>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <Link to="/login">Voltar para o Login</Link>
      </div>
    </div>
  );
}