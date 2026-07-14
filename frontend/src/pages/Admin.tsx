import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

interface Pedido {
  id: number;
  largura: number;
  altura: number;
  area: number;
  material: string;
  precoTotal: number;
  status: string;
  turno: string | null;
  dataAgendada: string | null;
  criadoEm: string;
}

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  AGENDADA: "Agendada",
  EM_EXECUCAO: "Em execução",
  CONCLUIDA: "Concluída",
};

const STATUS_COR: Record<string, string> = {
  PENDENTE: "#FAEEDA",
  AGENDADA: "#E6F1FB",
  EM_EXECUCAO: "#E1F5EE",
  CONCLUIDA: "#EAF3DE",
};

export default function Dashboard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidoAgendando, setPedidoAgendando] = useState<number | null>(null);
  const [data, setData] = useState("");
  const [turno, setTurno] = useState<"MANHA" | "TARDE">("MANHA");
  const [erro, setErro] = useState("");
  const { usuario, carregando, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (carregando) return;
    carregarPedidos();
  }, [carregando]);

  async function carregarPedidos() {
    try {
      const res = await api.get("/pedidos/meus-pedidos");
      setPedidos(res.data);
    } catch {
      navigate("/login");
    }
  }

  async function agendar(pedidoId: number) {
    try {
      await api.post(`/pedidos/agendar/${pedidoId}`, { dataAgendada: data, turno });
      setPedidoAgendando(null);
      setErro("");
      carregarPedidos();
    } catch {
      setErro("Horário indisponível, escolha outro");
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Meus pedidos</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => navigate("/")}
            style={{ padding: "8px 16px", border: "1px solid #0F6E56", background: "white", color: "#0F6E56", borderRadius: 8, cursor: "pointer" }}
          >
            Novo orçamento
          </button>
          {!carregando && usuario?.role === "ADMIN" && (
            <button
              onClick={() => navigate("/admin")}
              style={{ padding: "8px 16px", background: "#085041", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
            >
              Painel admin
            </button>
          )}
          <button
            onClick={handleLogout}
            style={{ padding: "8px 16px", background: "#eee", border: "none", borderRadius: 8, cursor: "pointer" }}
          >
            Sair
          </button>
        </div>
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
            <span>Material: <strong>{pedido.material}</strong></span>
            <span>Área: <strong>{pedido.area.toFixed(2)} m²</strong></span>
            <span>Dimensões: <strong>{pedido.largura} × {pedido.altura} m</strong></span>
            <span>Total: <strong>R$ {pedido.precoTotal.toLocaleString("pt-BR")}</strong></span>
            {pedido.dataAgendada && (
              <span>Data: <strong>{new Date(pedido.dataAgendada).toLocaleDateString("pt-BR")}</strong></span>
            )}
            {pedido.turno && (
              <span>Turno: <strong>{pedido.turno === "MANHA" ? "Manhã" : "Tarde"}</strong></span>
            )}
          </div>

          {pedido.status === "PENDENTE" && (
            <div style={{ marginTop: 12 }}>
              {pedidoAgendando === pedido.id ? (
                <div style={{ background: "#f9f9f9", borderRadius: 8, padding: 12 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input
                      type="date"
                      value={data}
                      onChange={e => setData(e.target.value)}
                      style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
                    />
                    <select
                      value={turno}
                      onChange={e => setTurno(e.target.value as "MANHA" | "TARDE")}
                      style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
                    >
                      <option value="MANHA">Manhã</option>
                      <option value="TARDE">Tarde</option>
                    </select>
                  </div>
                  {erro && <p style={{ color: "red", fontSize: 13, margin: "0 0 8px" }}>{erro}</p>}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => agendar(pedido.id)}
                      style={{ flex: 1, padding: 8, background: "#0F6E56", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setPedidoAgendando(null)}
                      style={{ padding: "8px 16px", border: "1px solid #ddd", background: "white", borderRadius: 6, cursor: "pointer" }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setPedidoAgendando(pedido.id)}
                  style={{ padding: "8px 16px", background: "#0F6E56", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
                >
                  Agendar instalação
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}