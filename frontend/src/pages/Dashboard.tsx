import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import api from "../services/api";
import { WHATSAPP_EMPRESA, abrirWhatsapp, mensagemSobrePedido } from "../lib/whatsapp";

interface Pedido {
  id: number;
  largura: number;
  altura: number;
  area: number;
  material: string | null;
  tipoInstalacao: "SACADA" | "CAMPO";
  precoTotal: number | null;
  status: string;
  turno: string | null;
  dataAgendada: string | null;
  criadoEm: string;
}

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: "Aguardando orçamento",
  AGUARDANDO_AGENDAMENTO: "Aguardando agendamento",
  AGENDADA: "Agendada",
  EM_EXECUCAO: "Em execução",
  CONCLUIDA: "Concluída",
};

const STATUS_COR: Record<string, string> = {
  PENDENTE: "#FAEEDA",
  AGUARDANDO_AGENDAMENTO: "#F3E8FA",
  AGENDADA: "#E6F1FB",
  EM_EXECUCAO: "#E1F5EE",
  CONCLUIDA: "#EAF3DE",
};

export default function Dashboard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const { carregando } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (carregando) return;
    api
      .get("/pedidos/meus-pedidos")
      .then(res => setPedidos(res.data))
      .catch(() => navigate("/login"));
  }, [carregando, navigate]);

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ margin: 0 }}>Meus pedidos</h1>
          <button
            onClick={() => navigate("/")}
            style={{ padding: "8px 16px", border: "1px solid #0F6E56", background: "white", color: "#0F6E56", borderRadius: 8, cursor: "pointer" }}
          >
            Novo orçamento
          </button>
        </div>

      {pedidos.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
          <p>Nenhum pedido ainda.</p>
          <button
            onClick={() => navigate("/")}
            style={{ padding: "10px 24px", background: "#0F6E56", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
          >
            Fazer orçamento
          </button>
        </div>
      )}

      {pedidos.map(pedido => (
        <div
          key={pedido.id}
          style={{ border: "1px solid #ddd", borderRadius: 12, padding: 20, marginBottom: 16 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontWeight: 500 }}>OS #{String(pedido.id).padStart(4, "0")}</span>
            <span style={{ background: STATUS_COR[pedido.status], padding: "4px 12px", borderRadius: 20, fontSize: 13 }}>
              {STATUS_LABEL[pedido.status]}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 14, color: "#555" }}>
            <span>Material: <strong>{pedido.material ?? "A definir"}</strong></span>
            <span>Área: <strong>{pedido.area.toFixed(2)} m²</strong></span>
            <span>Dimensões: <strong>{pedido.largura} × {pedido.altura} m</strong></span>
            <span>Total: <strong>{pedido.precoTotal != null ? `R$ ${pedido.precoTotal.toLocaleString("pt-BR")}` : "A definir"}</strong></span>
            {pedido.dataAgendada && (
              <span>Data: <strong>{new Date(pedido.dataAgendada).toLocaleDateString("pt-BR")}</strong></span>
            )}
            {pedido.turno && (
              <span>Turno: <strong>{pedido.turno === "MANHA" ? "Manhã" : "Tarde"}</strong></span>
            )}
          </div>

          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => abrirWhatsapp(WHATSAPP_EMPRESA, mensagemSobrePedido(pedido))}
              style={{ padding: "6px 14px", background: "#25D366", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
            >
              Falar no WhatsApp
            </button>
          </div>

          {pedido.status === "PENDENTE" && (
            <p style={{ margin: "12px 0 0", fontSize: 13, color: "#555" }}>
              {pedido.precoTotal != null
                ? "Enviamos o orçamento pelo WhatsApp. Para seguir, responda confirmando."
                : "Nossa equipe vai analisar as medidas e enviar o orçamento pelo WhatsApp."}
            </p>
          )}
          {pedido.status === "AGUARDANDO_AGENDAMENTO" && (
            <p style={{ margin: "12px 0 0", fontSize: 13, color: "#555" }}>
              Orçamento confirmado! Vamos combinar a data da instalação pelo WhatsApp.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}