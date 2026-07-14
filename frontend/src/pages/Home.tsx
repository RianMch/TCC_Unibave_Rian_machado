import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface Resultado {
  area: number;
  preco: number;
}

const PRODUTOS = [
  {
    nome: "Rede Polietileno",
    descricao: "Alta durabilidade, resistente a raios UV e intempéries. Ideal para sacadas e janelas com exposição ao sol.",
    vantagens: ["Durabilidade superior", "Resistente ao sol", "Fácil limpeza"],
    preco: "R$ 140/m²",
    cor: "#E1F5EE",
  },
  {
    nome: "Rede Poliamida",
    descricao: "Maior flexibilidade e leveza. Excelente para ambientes internos e locais com menor exposição climática.",
    vantagens: ["Mais leve", "Alta flexibilidade", "Menor custo"],
    preco: "R$ 110/m²",
    cor: "#E6F1FB",
  },
];

const OBRAS = [
  { local: "Apartamento — Florianópolis", area: "4,2 m²", material: "Polietileno" },
  { local: "Sacada — Criciúma", area: "6,8 m²", material: "Poliamida" },
  { local: "Janela — Tubarão", area: "2,1 m²", material: "Polietileno" },
  { local: "Varanda — Joinville", area: "9,0 m²", material: "Poliamida" },
];

export default function Home() {
  const [largura, setLargura] = useState(2.5);
  const [altura, setAltura] = useState(1.8);
  const [material, setMaterial] = useState<"POLIETILENO" | "POLIAMIDA">("POLIETILENO");
  const [cep, setCep] = useState("");
  const [distancia, setDistancia] = useState<number | null>(null);
  const [custoTotal, setCustoTotal] = useState<number | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  async function simular() {
    const res = await api.post("/pedidos/simular", { largura, altura, material });
    setResultado(res.data);
    setDistancia(null);
    setCustoTotal(null);
  }

  async function calcularComDistancia() {
    if (!cep || cep.length < 8) return alert("Digite um CEP válido");
    setCarregando(true);
    try {
      const res = await api.post("/pedidos/simular-com-distancia", {
        largura, altura, material, cep,
      });
      setResultado({ area: res.data.area, preco: res.data.preco });
      setDistancia(res.data.distanciaKm);
      setCustoTotal(res.data.custoTotal);
    } catch {
      alert("CEP não encontrado ou erro no cálculo");
    } finally {
      setCarregando(false);
    }
  }

  function abrirWhatsapp() {
    if (!resultado) return;
    const texto = encodeURIComponent(
      `Olá! Tenho interesse em um orçamento:\n` +
      `Material: ${material}\n` +
      `Dimensões: ${largura}m × ${altura}m\n` +
      `Área: ${resultado.area.toFixed(2)} m²\n` +
      `Estimativa: R$ ${(custoTotal ?? resultado.preco).toLocaleString("pt-BR")}`
    );
    window.open(`https://wa.me/5548999999999?text=${texto}`, "_blank");
  }

  async function contratar() {
    try {
      await api.post("/pedidos/criar", { largura, altura, material });
      navigate("/dashboard");
    } catch {
      navigate("/login");
    }
  }

  return (
    <div style={{ fontFamily: "sans-serif", color: "#222" }}>

      {/* Hero */}
      <div style={{ background: "#0F6E56", color: "white", padding: "48px 24px", textAlign: "center" }}>
        <h1 style={{ fontSize: 32, margin: "0 0 12px" }}>Redes de Proteção</h1>
        <p style={{ fontSize: 16, opacity: 0.85, margin: 0 }}>Segurança para sua família com qualidade e garantia de 3 anos</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
          <a href="/login" style={{ padding: "10px 24px", background: "white", color: "#0F6E56", borderRadius: 8, textDecoration: "none", fontWeight: 500 }}>Entrar</a>
          <a href="/register" style={{ padding: "10px 24px", border: "1px solid white", color: "white", borderRadius: 8, textDecoration: "none" }}>Criar conta</a>
        </div>
      </div>

      {/* Produtos */}
      <div style={{ maxWidth: 800, margin: "48px auto", padding: "0 24px" }}>
        <h2 style={{ textAlign: "center", marginBottom: 24 }}>Nossos produtos</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {PRODUTOS.map(p => (
            <div key={p.nome} style={{ background: p.cor, borderRadius: 12, padding: 24 }}>
              <h3 style={{ margin: "0 0 8px" }}>{p.nome}</h3>
              <p style={{ fontSize: 14, color: "#444", margin: "0 0 12px" }}>{p.descricao}</p>
              <ul style={{ fontSize: 14, paddingLeft: 18, margin: "0 0 12px", color: "#333" }}>
                {p.vantagens.map(v => <li key={v}>{v}</li>)}
              </ul>
              <span style={{ fontWeight: 500, color: "#085041" }}>{p.preco}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Obras realizadas */}
      <div style={{ background: "#f9f9f9", padding: "40px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", marginBottom: 24 }}>Obras realizadas</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {OBRAS.map((o, i) => (
              <div key={i} style={{ background: "white", borderRadius: 10, padding: 16, border: "1px solid #eee" }}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>{o.local}</div>
                <div style={{ fontSize: 13, color: "#666" }}>{o.area} · {o.material}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calculadora */}
      <div style={{ maxWidth: 500, margin: "48px auto", padding: "0 24px" }}>
        <h2 style={{ textAlign: "center", marginBottom: 24 }}>Simule seu orçamento</h2>

        <div style={{ marginBottom: 16 }}>
          <label>Largura (m)</label>
          <input type="number" step="0.1" value={largura}
            onChange={e => setLargura(Number(e.target.value))}
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4, borderRadius: 6, border: "1px solid #ddd" }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Altura (m)</label>
          <input type="number" step="0.1" value={altura}
            onChange={e => setAltura(Number(e.target.value))}
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4, borderRadius: 6, border: "1px solid #ddd" }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Material</label>
          <select value={material} onChange={e => setMaterial(e.target.value as "POLIETILENO" | "POLIAMIDA")}
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4, borderRadius: 6, border: "1px solid #ddd" }}>
            <option value="POLIETILENO">Polietileno — R$ 140/m²</option>
            <option value="POLIAMIDA">Poliamida — R$ 110/m²</option>
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Seu CEP (para calcular frete)</label>
          <input type="text" placeholder="Ex: 88900000" value={cep} maxLength={8}
            onChange={e => setCep(e.target.value.replace(/\D/g, ""))}
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4, borderRadius: 6, border: "1px solid #ddd" }} />
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button onClick={simular}
            style={{ flex: 1, padding: 12, background: "#888", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>
            Simular sem frete
          </button>
          <button onClick={calcularComDistancia} disabled={carregando}
            style={{ flex: 1, padding: 12, background: "#0F6E56", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>
            {carregando ? "Calculando..." : "Simular com frete"}
          </button>
        </div>

        {resultado && (
          <div style={{ background: "#E1F5EE", borderRadius: 10, padding: 16, marginBottom: 12 }}>
            <p style={{ margin: "0 0 4px" }}>Área: <strong>{resultado.area.toFixed(2)} m²</strong></p>
            <p style={{ margin: "0 0 4px" }}>Rede: <strong>R$ {resultado.preco.toLocaleString("pt-BR")}</strong></p>
            {distancia !== null && (
              <p style={{ margin: "0 0 4px" }}>Distância: <strong>{distancia.toFixed(1)} km</strong></p>
            )}
            {custoTotal !== null && (
              <p style={{ margin: 0, fontWeight: 500, color: "#085041", fontSize: 18 }}>
                Total com frete: R$ {custoTotal.toLocaleString("pt-BR")}
              </p>
            )}
          </div>
        )}

        {resultado && (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={abrirWhatsapp}
              style={{ flex: 1, padding: 12, background: "#25D366", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>
              Enviar pelo WhatsApp
            </button>
            <button onClick={contratar}
              style={{ flex: 1, padding: 12, background: "#085041", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>
              Contratar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}