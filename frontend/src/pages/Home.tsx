import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface Resultado {
  area: number;
  preco: number;
}

export default function Home() {
  const [largura, setLargura] = useState(2.5);
  const [altura, setAltura] = useState(1.8);
  const [material, setMaterial] = useState<"POLIETILENO" | "POLIAMIDA">("POLIETILENO");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const navigate = useNavigate();

  async function simular() {
    const res = await api.post("/pedidos/simular", { largura, altura, material });
    setResultado(res.data);
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
    <div style={{ maxWidth: 500, margin: "60px auto", fontFamily: "sans-serif" }}>
      <h1>Redes de Proteção</h1>
      <p>Simule seu orçamento gratuitamente</p>

      <div style={{ marginBottom: 16 }}>
        <label>Largura (m)</label>
        <input
          type="number"
          step="0.1"
          value={largura}
          onChange={e => setLargura(Number(e.target.value))}
          style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>Altura (m)</label>
        <input
          type="number"
          step="0.1"
          value={altura}
          onChange={e => setAltura(Number(e.target.value))}
          style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>Material</label>
        <select
          value={material}
          onChange={e => setMaterial(e.target.value as "POLIETILENO" | "POLIAMIDA")}
          style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
        >
          <option value="POLIETILENO">Polietileno</option>
          <option value="POLIAMIDA">Poliamida</option>
        </select>
      </div>

      <button
        onClick={simular}
        style={{ width: "100%", padding: 12, background: "#0F6E56", color: "white", border: "none", borderRadius: 8, cursor: "pointer", marginBottom: 12 }}
      >
        Simular orçamento
      </button>

      {resultado && (
        <div style={{ background: "#E1F5EE", borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <p>Área: <strong>{resultado.area.toFixed(2)} m²</strong></p>
          <p>Estimativa: <strong>R$ {resultado.preco.toLocaleString("pt-BR")}</strong></p>
        </div>
      )}

      {resultado && (
        <button
          onClick={contratar}
          style={{ width: "100%", padding: 12, background: "#085041", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          Contratar instalação
        </button>
      )}

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <a href="/login">Já tenho conta</a>
        {" · "}
        <a href="/register">Criar conta</a>
      </div>
    </div>
  );
}