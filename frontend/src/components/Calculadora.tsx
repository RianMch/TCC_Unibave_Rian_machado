import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface Resultado {
  area: number;
  preco: number;
  distanciaKm?: number;
  custoGasolina?: number;
  custoTotal?: number;
}

/**
 * Formulário de simulação de orçamento (largura, altura, material) +
 * botão de contratar. Extraído de Home.tsx para poder ser reaproveitado
 * (ou testado) isoladamente da página em volta dele.
 *
 * O CEP é opcional: se preenchido, o orçamento já sai com o custo de
 * transporte embutido (rota /simular-com-distancia); se deixado em
 * branco, mostra só o valor da rede em si (rota /simular).
 */
export default function Calculadora() {
  const [largura, setLargura] = useState(2.5);
  const [altura, setAltura] = useState(1.8);
  const [material, setMaterial] = useState<"POLIETILENO" | "POLIAMIDA">("POLIETILENO");
  const [cep, setCep] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  async function simular() {
    setErro("");
    setCarregando(true);
    try {
      const cepLimpo = cep.trim();
      const rota = cepLimpo ? "/pedidos/simular-com-distancia" : "/pedidos/simular";
      const corpo = cepLimpo ? { largura, altura, material, cep: cepLimpo } : { largura, altura, material };
      const res = await api.post(rota, corpo);
      setResultado(res.data);
    } catch {
      setErro(
        cep.trim()
          ? "Não foi possível calcular o orçamento. Confira o CEP e os valores e tente novamente."
          : "Não foi possível calcular o orçamento. Confira os valores e tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function contratar() {
    try {
      await api.post("/pedidos/criar", { largura, altura, material });
      navigate("/dashboard");
    } catch {
      // sem sessão válida (ou erro de negócio) — manda para o login
      navigate("/login");
    }
  }

  function compartilharWhatsapp() {
    if (!resultado) return;

    const linhas = [
      "Orçamento de rede de proteção:",
      `Dimensões: ${largura} x ${altura} m (${resultado.area.toFixed(2)} m²)`,
      `Material: ${material === "POLIETILENO" ? "Polietileno" : "Poliamida"}`,
      `Valor da rede: R$ ${resultado.preco.toLocaleString("pt-BR")}`,
    ];

    if (resultado.custoTotal !== undefined) {
      linhas.push(`Transporte (${resultado.distanciaKm?.toFixed(1)} km): R$ ${resultado.custoGasolina?.toLocaleString("pt-BR")}`);
      linhas.push(`Total: R$ ${resultado.custoTotal.toLocaleString("pt-BR")}`);
    }

    const mensagem = encodeURIComponent(linhas.join("\n"));
    window.open(`https://wa.me/?text=${mensagem}`, "_blank");
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <label>Largura (m)</label>
        <input
          type="number"
          step="0.1"
          min="0.1"
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
          min="0.1"
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

      <div style={{ marginBottom: 16 }}>
        <label>CEP (opcional — inclui o custo de transporte)</label>
        <input
          type="text"
          placeholder="00000-000"
          value={cep}
          onChange={e => setCep(e.target.value)}
          style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
        />
      </div>

      <button
        onClick={simular}
        disabled={carregando}
        style={{
          width: "100%",
          padding: 12,
          background: "#0F6E56",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: carregando ? "default" : "pointer",
          opacity: carregando ? 0.7 : 1,
          marginBottom: 12,
        }}
      >
        {carregando ? "Calculando..." : "Simular orçamento"}
      </button>

      {erro && <p style={{ color: "red", marginBottom: 12 }}>{erro}</p>}

      {resultado && (
        <div style={{ background: "#E1F5EE", borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <p>Área: <strong>{resultado.area.toFixed(2)} m²</strong></p>
          <p>Valor da rede: <strong>R$ {resultado.preco.toLocaleString("pt-BR")}</strong></p>
          {resultado.custoTotal !== undefined && (
            <>
              <p>
                Transporte ({resultado.distanciaKm?.toFixed(1)} km):{" "}
                <strong>R$ {resultado.custoGasolina?.toLocaleString("pt-BR")}</strong>
              </p>
              <p>Total: <strong>R$ {resultado.custoTotal.toLocaleString("pt-BR")}</strong></p>
            </>
          )}
        </div>
      )}

      {resultado && (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={contratar}
            style={{ flex: 1, padding: 12, background: "#085041", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
          >
            Contratar instalação
          </button>
          <button
            onClick={compartilharWhatsapp}
            title="Enviar orçamento pelo WhatsApp"
            style={{ padding: "12px 16px", background: "#25D366", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
          >
            Enviar por WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}