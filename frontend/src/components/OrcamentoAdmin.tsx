import { useRef, useState } from "react";
import { isAxiosError } from "axios";
import api from "../services/api";
import { lerPreco, moeda } from "../lib/formato";
import { abrirWhatsapp, mensagemOrcamentoParaCliente, numeroParaWhatsapp } from "../lib/whatsapp";

type Material = "POLIETILENO" | "POLIAMIDA";

const MATERIAIS: { valor: Material; nome: string }[] = [
  { valor: "POLIETILENO", nome: "Polietileno" },
  { valor: "POLIAMIDA", nome: "Poliamida" },
];

export interface PedidoOrcamento {
  id: number;
  largura: number;
  altura: number;
  area: number;
  material: string | null;
  tipoInstalacao: "SACADA" | "CAMPO";
  precoTotal: number | null;
  usuario: { nome: string; telefone: string | null };
}

const paraCampo = (v: number | null) =>
  v == null ? "" : v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface Props {
  pedido: PedidoOrcamento;
  onSalvo: () => void;
}

// Use key={`${id}-${material}-${precoTotal}`} no pai: ao salvar e recarregar,
// o componente remonta com os valores novos.

export default function OrcamentoAdmin({ pedido, onSalvo }: Props) {
  const [material, setMaterial] = useState<string>(pedido.material ?? "");
  const [preco, setPreco] = useState(paraCampo(pedido.precoTotal));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const editouPreco = useRef(pedido.precoTotal != null);
  const idPedido = `orc-${pedido.id}`;

  async function escolherMaterial(novo: string) {
    setMaterial(novo);
    setErro("");
    if (!novo || editouPreco.current) return;
    // Sugestão de preço (área x preço do material); o admin pode ajustar.
    try {
      const res = await api.post("/pedidos/simular", {
        largura: pedido.largura,
        altura: pedido.altura,
        tipoInstalacao: pedido.tipoInstalacao,
        material: novo,
      });
      if (!editouPreco.current && typeof res.data?.preco === "number") setPreco(paraCampo(res.data.preco));
    } catch {
      /* sugestão é opcional: se falhar, o admin digita o valor */
    }
  }

  const valor = lerPreco(preco);
  const sujo = material !== (pedido.material ?? "") || valor !== pedido.precoTotal;
  const podeSalvar = !!material && valor !== null && valor > 0 && sujo && !salvando;
  const salvo = pedido.material != null && pedido.precoTotal != null;
  const telefoneOk = numeroParaWhatsapp(pedido.usuario.telefone) !== null;

  async function salvar() {
    if (!podeSalvar || valor === null) return;
    setSalvando(true);
    setErro("");
    try {
      await api.patch(`/pedidos/orcamento/${pedido.id}`, { material, precoTotal: valor });
      onSalvo();
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 400) setErro("Dados inválidos. Confira o material e o valor.");
      else setErro("Não foi possível salvar o orçamento. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  function enviar() {
    if (!salvo) return;
    abrirWhatsapp(
      pedido.usuario.telefone,
      mensagemOrcamentoParaCliente({
        nomeCliente: pedido.usuario.nome,
        id: pedido.id,
        tipoInstalacao: pedido.tipoInstalacao,
        largura: pedido.largura,
        altura: pedido.altura,
        area: pedido.area,
        material: pedido.material as string,
        precoTotal: pedido.precoTotal as number,
      }),
    );
  }

  const campo = { padding: 8, borderRadius: 6, border: "1px solid #ddd" } as const;

  return (
    <div style={{ background: "#f9f9f9", borderRadius: 8, padding: 12, marginTop: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Orçamento definitivo</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <label htmlFor={`${idPedido}-material`} style={{ display: "block", fontSize: 12, color: "#555" }}>
            Material
          </label>
          <select
            id={`${idPedido}-material`}
            value={material}
            onChange={e => escolherMaterial(e.target.value)}
            style={campo}
          >
            <option value="">Selecione...</option>
            {MATERIAIS.map(m => (
              <option key={m.valor} value={m.valor}>{m.nome}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${idPedido}-preco`} style={{ display: "block", fontSize: 12, color: "#555" }}>
            Valor total (R$)
          </label>
          <input
            id={`${idPedido}-preco`}
            inputMode="decimal"
            placeholder="0,00"
            value={preco}
            onChange={e => {
              editouPreco.current = true;
              setPreco(e.target.value);
              setErro("");
            }}
            style={{ ...campo, width: 130 }}
          />
        </div>
        <button
          type="button"
          onClick={salvar}
          disabled={!podeSalvar}
          style={{ ...campo, background: "#0F6E56", color: "white", border: "none", cursor: podeSalvar ? "pointer" : "default", opacity: podeSalvar ? 1 : 0.5 }}
        >
          {salvando ? "Salvando..." : "Salvar orçamento"}
        </button>
        <button
          type="button"
          onClick={enviar}
          disabled={!salvo || sujo}
          style={{ ...campo, background: "#25D366", color: "white", border: "none", cursor: salvo && !sujo ? "pointer" : "default", opacity: salvo && !sujo ? 1 : 0.5 }}
        >
          Enviar orçamento por WhatsApp
        </button>
      </div>

      {valor === null && preco.trim() !== "" && (
        <p role="alert" style={{ color: "red", fontSize: 13, margin: "8px 0 0" }}>Valor inválido.</p>
      )}
      {erro && <p role="alert" style={{ color: "red", fontSize: 13, margin: "8px 0 0" }}>{erro}</p>}
      {salvo && sujo && (
        <p style={{ fontSize: 12, color: "#888", margin: "8px 0 0" }}>Salve as alterações antes de enviar.</p>
      )}
      {salvo && !sujo && (
        <p style={{ fontSize: 12, color: "#555", margin: "8px 0 0" }}>
          Será enviado: {moeda(pedido.precoTotal as number)}.
          {!telefoneOk && " O cliente não tem telefone cadastrado: o WhatsApp abrirá sem destinatário."}
        </p>
      )}
    </div>
  );
}
