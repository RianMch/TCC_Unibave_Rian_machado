import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { isAxiosError } from "axios";
import api from "../services/api";
import OrcamentoAdmin from "../components/OrcamentoAdmin";
import AgendarAdmin from "../components/AgendarAdmin";

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
  usuario: {
    nome: string;
    email: string;
    telefone: string | null;
  };
}
const STATUS_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
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

export default function Admin() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [filtro, setFiltro] = useState("TODOS");
  const [erroAcao, setErroAcao] = useState("");
  const { usuario, carregando } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // espera a checagem inicial de sessão (/auth/me) terminar antes de
    // decidir se redireciona — evita chutar o usuário para fora ao dar F5
    if (carregando) return;

    if (!usuario || usuario.role !== "ADMIN") {
      navigate("/dashboard");
      return;
    }
    carregarPedidos();
  }, [usuario, carregando]);

  if (carregando) {
    return (
      <div style={{ textAlign: "center", padding: 60, fontFamily: "sans-serif", color: "#888" }}>
        Carregando...
      </div>
    );
  }

  async function carregarPedidos() {
    try {
      const res = await api.get("/pedidos/todos");
      setPedidos(res.data);
    } catch {
      navigate("/login");
    }
  }

  async function atualizarStatus(pedidoId: number, status: string) {
    await api.patch(`/pedidos/status/${pedidoId}`, { status });
    carregarPedidos();
  }

  async function confirmarOrcamento(pedidoId: number) {
    try {
      await api.patch(`/pedidos/confirmar/${pedidoId}`);
      setErroAcao("");
      carregarPedidos();
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 409) setErroAcao(e.response.data?.erro ?? "Pedido não pode ser confirmado agora.");
      else if (isAxiosError(e) && e.response?.status === 404) setErroAcao("Rota ou pedido não encontrado. Reinicie o backend (git pull + npm run dev).");
      else if (isAxiosError(e) && e.response?.status === 500) setErroAcao("Erro no servidor. Rode 'npx prisma migrate dev' e 'npx prisma generate' no backend e reinicie.");
      else setErroAcao("Não foi possível confirmar. Tente novamente.");
    }
  }

  async function concluir(pedidoId: number) {
    await api.patch(`/pedidos/concluir/${pedidoId}`);
    carregarPedidos();
  }

  const pedidosFiltrados = filtro === "TODOS"
    ? pedidos
    : pedidos.filter(p => p.status === filtro);

  const contadores = {
    total: pedidos.length,
    pendente: pedidos.filter(p => p.status === "PENDENTE").length,
    agendada: pedidos.filter(p => p.status === "AGENDADA").length,
    emExecucao: pedidos.filter(p => p.status === "EM_EXECUCAO").length,
    concluida: pedidos.filter(p => p.status === "CONCLUIDA").length,
  };

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
        <h1 style={{ margin: "0 0 24px" }}>Painel administrativo</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total", valor: contadores.total, cor: "#f5f5f5" },
          { label: "Pendentes", valor: contadores.pendente, cor: "#FAEEDA" },
          { label: "Agendadas", valor: contadores.agendada, cor: "#E6F1FB" },
          { label: "Concluídas", valor: contadores.concluida, cor: "#EAF3DE" },
        ].map(card => (
          <div key={card.label} style={{ background: card.cor, borderRadius: 10, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 500 }}>{card.valor}</div>
            <div style={{ fontSize: 13, color: "#555" }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["TODOS", "PENDENTE", "AGUARDANDO_AGENDAMENTO", "AGENDADA", "EM_EXECUCAO", "CONCLUIDA"].map(s => (
          <button
            key={s}
            onClick={() => setFiltro(s)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: "1px solid #ddd",
              background: filtro === s ? "#0F6E56" : "white",
              color: filtro === s ? "white" : "#555",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {s === "TODOS" ? "Todos" : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {erroAcao && <p role="alert" style={{ color: "red" }}>{erroAcao}</p>}

      {pedidosFiltrados.map(pedido => (
        <div
          key={pedido.id}
          style={{ border: "1px solid #ddd", borderRadius: 12, padding: 20, marginBottom: 16 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <span style={{ fontWeight: 500 }}>OS #{String(pedido.id).padStart(4, "0")}</span>
              <span style={{ marginLeft: 12, color: "#555", fontSize: 14 }}>{pedido.usuario.nome}</span>
              <span style={{ marginLeft: 8, color: "#888", fontSize: 13 }}>{pedido.usuario.email}</span>
              {pedido.usuario.telefone && (
                <span style={{ marginLeft: 8, color: "#888", fontSize: 13 }}>{pedido.usuario.telefone}</span>
              )}
            </div>
            <span style={{ background: STATUS_COR[pedido.status], padding: "4px 12px", borderRadius: 20, fontSize: 13 }}>
              {STATUS_LABEL[pedido.status]}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 14, color: "#555" }}>
          <span>Tipo: <strong>{pedido.tipoInstalacao === "SACADA" ? "Sacada" : "Campo"}</strong></span>
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

          {(pedido.status === "PENDENTE" || pedido.status === "AGUARDANDO_AGENDAMENTO") && (
            <OrcamentoAdmin
              key={`${pedido.id}-${pedido.material}-${pedido.precoTotal}`}
              pedido={pedido} onSalvo={carregarPedidos} />
          )}

          {pedido.status === "PENDENTE" && (
            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => confirmarOrcamento(pedido.id)}
                disabled={pedido.material == null || pedido.precoTotal == null}
                style={{ padding: "6px 14px", background: "#F3E8FA", border: "1px solid #6B3FA0", color: "#6B3FA0", borderRadius: 6, cursor: "pointer", fontSize: 13, opacity: pedido.precoTotal == null ? 0.5 : 1 }}
              >
                Cliente confirmou o orçamento
              </button>
              <span style={{ marginLeft: 8, fontSize: 12, color: "#888" }}>
                Use depois que o cliente responder confirmando no WhatsApp.
              </span>
            </div>
          )}

          {pedido.status === "AGUARDANDO_AGENDAMENTO" && (
            <AgendarAdmin pedidoId={pedido.id} onAgendado={carregarPedidos} />
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {pedido.status === "AGENDADA" && (
              <button
                onClick={() => atualizarStatus(pedido.id, "EM_EXECUCAO")}
                style={{ padding: "6px 14px", background: "#E6F1FB", border: "1px solid #185FA5", color: "#185FA5", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
              >
                Iniciar execução
              </button>
            )}
            {pedido.status === "EM_EXECUCAO" && (
              <button
                onClick={() => concluir(pedido.id)}
                style={{ padding: "6px 14px", background: "#EAF3DE", border: "1px solid #3B6D11", color: "#3B6D11", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
              >
                Concluir e gerar certificado
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}