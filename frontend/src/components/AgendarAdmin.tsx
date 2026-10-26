import { useState } from "react";
import { isAxiosError } from "axios";
import api from "../services/api";

interface Props {
  pedidoId: number;
  onAgendado: () => void;
}

/** O admin define data e turno depois que o cliente confirmou o orçamento. */
export default function AgendarAdmin({ pedidoId, onAgendado }: Props) {
  const [data, setData] = useState("");
  const [turno, setTurno] = useState<"MANHA" | "TARDE">("MANHA");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const id = `agenda-${pedidoId}`;
  const campo = { padding: 8, borderRadius: 6, border: "1px solid #ddd" } as const;
  const hoje = new Date().toLocaleDateString("sv-SE"); // AAAA-MM-DD no fuso local

  async function agendar() {
    setSalvando(true);
    setErro("");
    try {
      await api.post(`/pedidos/agendar/${pedidoId}`, { dataAgendada: data, turno });
      onAgendado();
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 409) setErro(e.response.data?.erro ?? "Horário indisponível, escolha outro.");
      else if (isAxiosError(e) && e.response?.status === 400) setErro("Data inválida.");
      else setErro("Não foi possível agendar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div style={{ background: "#f9f9f9", borderRadius: 8, padding: 12, marginTop: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Agendar instalação</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <label htmlFor={`${id}-data`} style={{ display: "block", fontSize: 12, color: "#555" }}>Data</label>
          <input id={`${id}-data`} type="date" min={hoje} value={data} onChange={e => setData(e.target.value)} style={campo} />
        </div>
        <div>
          <label htmlFor={`${id}-turno`} style={{ display: "block", fontSize: 12, color: "#555" }}>Turno</label>
          <select id={`${id}-turno`} value={turno} onChange={e => setTurno(e.target.value as "MANHA" | "TARDE")} style={campo}>
            <option value="MANHA">Manhã</option>
            <option value="TARDE">Tarde</option>
          </select>
        </div>
        <button
          type="button"
          onClick={agendar}
          disabled={!data || salvando}
          style={{ ...campo, background: "#0F6E56", color: "white", border: "none", cursor: data && !salvando ? "pointer" : "default", opacity: data && !salvando ? 1 : 0.5 }}
        >
          {salvando ? "Agendando..." : "Agendar"}
        </button>
      </div>
      {erro && <p role="alert" style={{ color: "red", fontSize: 13, margin: "8px 0 0" }}>{erro}</p>}
    </div>
  );
}
