import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import api from "../services/api";
import { moeda, numero } from "../lib/formato";
import { WHATSAPP_EMPRESA, abrirWhatsapp, mensagemClienteParaEmpresa } from "../lib/whatsapp";

type Tipo = "SACADA" | "CAMPO";
type Material = "POLIETILENO" | "POLIAMIDA";

const MATERIAIS: { valor: Material; nome: string }[] = [
  { valor: "POLIETILENO", nome: "Polietileno" },
  { valor: "POLIAMIDA", nome: "Poliamida" },
];

interface Estimativa {
  area: number;
  distanciaKm?: number;
  transporte?: number;
  porMaterial: { material: Material; nome: string; preco: number; total: number }[];
}

/** Extrai a mensagem de erro que o backend manda em respostas 400. */
function mensagemDoBackend(e: unknown): string | null {
  if (!isAxiosError(e) || e.response?.status !== 400) return null;
  const dados = e.response.data;
  if (Array.isArray(dados?.detalhes) && dados.detalhes[0]?.mensagem) return dados.detalhes[0].mensagem;
  if (typeof dados?.erro === "string") return dados.erro;
  return null;
}

export default function Calculadora() {
  const [largura, setLargura] = useState(2.5);
  const [altura, setAltura] = useState(1.8);
  const [tipoInstalacao, setTipoInstalacao] = useState<Tipo>("SACADA");
  const [cep, setCep] = useState("");
  const [estimativa, setEstimativa] = useState<Estimativa | null>(null);
  const [simulando, setSimulando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [pedidoId, setPedidoId] = useState<number | null>(null);
  const [precisaLogin, setPrecisaLogin] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  // Qualquer mudança nos campos invalida a estimativa que estava na tela.
  function editar<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setEstimativa(null);
      setErro("");
    };
  }

  /** Simulação: rotas públicas, não exigem login. */
  async function simular(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setPrecisaLogin(false);
    setEstimativa(null);
    setSimulando(true);

    try {
      const base = { largura, altura, tipoInstalacao };
      const cepLimpo = cep.trim();

      let area: number;
      let distanciaKm: number | undefined;
      let transporte: number | undefined;
      let precoPolietileno: number;
      let precoPoliamida: number;

      if (cepLimpo) {
        // Uma chamada com distância (usa ViaCEP/OpenRouteService) + uma simples
        // para o outro material. O transporte não depende do material.
        const [comDistancia, poliamida] = await Promise.all([
          api.post("/pedidos/simular-com-distancia", { ...base, material: "POLIETILENO", cep: cepLimpo }),
          api.post("/pedidos/simular", { ...base, material: "POLIAMIDA" }),
        ]);
        area = comDistancia.data.area;
        distanciaKm = comDistancia.data.distanciaKm;
        transporte = comDistancia.data.custoGasolina;
        precoPolietileno = comDistancia.data.preco;
        precoPoliamida = poliamida.data.preco;
      } else {
        const [polietileno, poliamida] = await Promise.all([
          api.post("/pedidos/simular", { ...base, material: "POLIETILENO" }),
          api.post("/pedidos/simular", { ...base, material: "POLIAMIDA" }),
        ]);
        area = polietileno.data.area;
        precoPolietileno = polietileno.data.preco;
        precoPoliamida = poliamida.data.preco;
      }

      const precos: Record<Material, number> = { POLIETILENO: precoPolietileno, POLIAMIDA: precoPoliamida };
      setEstimativa({
        area,
        distanciaKm,
        transporte,
        porMaterial: MATERIAIS.map(m => ({
          material: m.valor,
          nome: m.nome,
          preco: precos[m.valor],
          total: precos[m.valor] + (transporte ?? 0),
        })),
      });
    } catch (err) {
      const doBackend = mensagemDoBackend(err);
      if (doBackend) setErro(doBackend);
      else if (isAxiosError(err) && !err.response) setErro("Não foi possível conectar ao servidor.");
      else setErro("Não foi possível calcular a estimativa. Tente novamente.");
    } finally {
      setSimulando(false);
    }
  }

  /** Solicitação: rota protegida, exige login. */
  async function solicitar() {
    setErro("");
    setPrecisaLogin(false);
    setEnviando(true);
    try {
      const res = await api.post("/pedidos", { largura, altura, tipoInstalacao, cep: cep.trim() || undefined });
      setPedidoId(typeof res.data?.id === "number" ? res.data.id : null);
      setEnviado(true);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) setPrecisaLogin(true);
      else setErro(mensagemDoBackend(err) ?? "Não foi possível enviar a solicitação. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  function compartilharWhatsapp() {
    const texto = mensagemClienteParaEmpresa({
      id: pedidoId ?? undefined,
      tipoInstalacao,
      largura,
      altura,
      cep: cep.trim() || undefined,
      area: estimativa?.area,
      estimativa: estimativa?.porMaterial.map(m => ({ nome: m.nome, total: m.total })),
    });
    abrirWhatsapp(WHATSAPP_EMPRESA, texto);
  }

  if (enviado) {
    return (
      <div role="status" style={{ background: "#EAF3DE", padding: 20, borderRadius: 8, textAlign: "center" }}>
        <h3>Solicitação enviada com sucesso!</h3>
        <p style={{ color: "#333", margin: "12px 0" }}>
          Sua solicitação foi encaminhada para nossa equipe. O administrador irá analisar as medidas, definir o material adequado e entrar em contato com o orçamento detalhado.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
          <button
            onClick={compartilharWhatsapp}
            style={{ padding: "10px 16px", background: "#25D366", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
          >
            Avisar no WhatsApp
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            style={{ padding: "10px 16px", background: "#0F6E56", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
          >
            Ver meus pedidos
          </button>
          <button
            onClick={() => { setEnviado(false); setPedidoId(null); }}
            style={{ padding: "10px 16px", background: "white", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer" }}
          >
            Fazer outra solicitação
          </button>
        </div>
      </div>
    );
  }

  const campo = { display: "block", width: "100%", padding: 8, marginTop: 4 } as const;

  return (
    <form onSubmit={simular}>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="calc-tipo">Tipo de Instalação</label>
        <select
          id="calc-tipo"
          value={tipoInstalacao}
          onChange={e => editar(setTipoInstalacao)(e.target.value as Tipo)}
          style={campo}
        >
          <option value="SACADA">Sacada</option>
          <option value="CAMPO">Campo</option>
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="calc-largura">Largura aproximada (m)</label>
        <input
          id="calc-largura"
          type="number"
          step="0.1"
          min="0.1"
          required
          value={largura}
          onChange={e => editar(setLargura)(Number(e.target.value))}
          style={campo}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="calc-altura">Altura aproximada (m)</label>
        <input
          id="calc-altura"
          type="number"
          step="0.1"
          min="0.1"
          required
          value={altura}
          onChange={e => editar(setAltura)(Number(e.target.value))}
          style={campo}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="calc-cep">CEP (opcional — inclui o custo de transporte)</label>
        <input
          id="calc-cep"
          type="text"
          placeholder="00000-000"
          value={cep}
          onChange={e => editar(setCep)(e.target.value)}
          style={campo}
        />
      </div>

      <button
        type="submit"
        disabled={simulando}
        style={{
          width: "100%",
          padding: 12,
          background: "#0F6E56",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: simulando ? "default" : "pointer",
          opacity: simulando ? 0.7 : 1,
          marginBottom: 12,
        }}
      >
        {simulando ? "Calculando..." : "Simular orçamento"}
      </button>

      {erro && <p role="alert" style={{ color: "red", marginBottom: 12 }}>{erro}</p>}

      {estimativa && (
        <div role="status" style={{ background: "#E1F5EE", borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <p style={{ margin: "0 0 8px" }}>Área: <strong>{numero(estimativa.area, 2)} m²</strong></p>
          {estimativa.porMaterial.map(m => (
            <p key={m.material} style={{ margin: "0 0 4px" }}>
              {m.nome}: <strong>{moeda(m.preco)}</strong>
            </p>
          ))}
          {estimativa.transporte !== undefined && (
            <p style={{ margin: "8px 0 0" }}>
              Transporte ({numero(estimativa.distanciaKm ?? 0, 1)} km): <strong>{moeda(estimativa.transporte)}</strong>
            </p>
          )}
          {estimativa.transporte !== undefined && (
            <div style={{ marginTop: 8 }}>
              {estimativa.porMaterial.map(m => (
                <p key={m.material} style={{ margin: "0 0 4px" }}>
                  Total com {m.nome.toLowerCase()}: <strong>{moeda(m.total)}</strong>
                </p>
              ))}
            </div>
          )}
          <p style={{ margin: "12px 0 0", fontSize: 13, color: "#555" }}>
            Valores estimados. O material e o orçamento final são confirmados pela equipe após analisar as medidas.
          </p>
        </div>
      )}

      {precisaLogin && (
        <div role="alert" style={{ background: "#FAEEDA", borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <p style={{ margin: "0 0 8px" }}>Para enviar a solicitação, entre na sua conta ou crie uma.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{ padding: "8px 14px", background: "#0F6E56", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => navigate("/register")}
              style={{ padding: "8px 14px", background: "white", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer" }}
            >
              Criar conta
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
        <button
          type="button"
          onClick={solicitar}
          disabled={enviando}
          style={{
            width: "100%",
            padding: 12,
            background: "#085041",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: enviando ? "default" : "pointer",
            opacity: enviando ? 0.7 : 1,
          }}
        >
          {enviando ? "Enviando..." : "Solicitar orçamento / instalação"}
        </button>

        <button
          type="button"
          onClick={compartilharWhatsapp}
          style={{ width: "100%", padding: 12, background: "#25D366", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          Enviar detalhes por WhatsApp
        </button>
      </div>
    </form>
  );
}
