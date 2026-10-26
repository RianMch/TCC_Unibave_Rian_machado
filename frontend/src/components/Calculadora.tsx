import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Calculadora() {
  const [largura, setLargura] = useState(2.5);
  const [altura, setAltura] = useState(1.8);
  const [tipoInstalacao, setTipoInstalacao] = useState<"SACADA" | "CAMPO">("SACADA");
  const [cep, setCep] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  async function solicitarOrcamento(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const cepLimpo = cep.trim();
      
      // Envia o pedido para o backend. O material e preço serão definidos pelo Admin.
      await api.post("/pedidos", {
        largura,
        altura,
        tipoInstalacao,
        cep: cepLimpo || undefined,
      });

      setEnviado(true);
    } catch {
      setErro("Não foi possível enviar a solicitação. Verifique se está logado e tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  function compartilharWhatsapp() {
    const linhas = [
      "Olá! Gostaria de solicitar um orçamento para rede de proteção:",
      `Tipo de Instalação: ${tipoInstalacao === "SACADA" ? "Sacada" : "Campo"}`,
      `Dimensões aproximadas: ${largura}m (largura) x ${altura}m (altura)`,
      cep.trim() ? `CEP: ${cep.trim()}` : "",
    ].filter(Boolean);

    const mensagem = encodeURIComponent(linhas.join("\n"));
    window.open(`https://wa.me/?text=${mensagem}`, "_blank");
  }

  if (enviado) {
    return (
      <div style={{ background: "#EAF3DE", padding: 20, borderRadius: 8, textAlign: "center" }}>
        <h3>Solicitação enviada com sucesso!</h3>
        <p style={{ color: "#333", margin: "12px 0" }}>
          Sua solicitação foi encaminhada para nossa equipe. O administrador irá analisar as medidas, definir o material adequado e entrar em contato com o orçamento detalhado.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{ padding: "10px 16px", background: "#0F6E56", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
          >
            Ver meus pedidos
          </button>
          <button
            onClick={() => setEnviado(false)}
            style={{ padding: "10px 16px", background: "white", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer" }}
          >
            Fazer outra solicitação
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={solicitarOrcamento}>
      <div style={{ marginBottom: 16 }}>
        <label>Tipo de Instalação</label>
        <select
          value={tipoInstalacao}
          onChange={e => setTipoInstalacao(e.target.value as "SACADA" | "CAMPO")}
          style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
        >
          <option value="SACADA">Sacada</option>
          <option value="CAMPO">Campo</option>
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>Largura aproximada (m)</label>
        <input
          type="number"
          step="0.1"
          min="0.1"
          value={largura}
          onChange={e => setLargura(Number(e.target.value))}
          required
          style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>Altura aproximada (m)</label>
        <input
          type="number"
          step="0.1"
          min="0.1"
          value={altura}
          onChange={e => setAltura(Number(e.target.value))}
          required
          style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>CEP (opcional para localização)</label>
        <input
          type="text"
          placeholder="00000-000"
          value={cep}
          onChange={e => setCep(e.target.value)}
          style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>

      {erro && <p style={{ color: "red", marginBottom: 12 }}>{erro}</p>}

      <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
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
            cursor: carregando ? "not-allowed" : "pointer",
          }}
        >
          {carregando ? "Enviando..." : "Solicitar Orçamento / Instalação"}
        </button>

        <button
          type="button"
          onClick={compartilharWhatsapp}
          style={{
            width: "100%",
            padding: 12,
            background: "#25D366",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Enviar detalhes por WhatsApp
        </button>
      </div>
    </form>
  );
}