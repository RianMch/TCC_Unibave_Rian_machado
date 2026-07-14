import Calculadora from "../components/Calculadora";

export default function Home() {
  return (
    <div style={{ maxWidth: 500, margin: "60px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1>Redes de Proteção</h1>
      <p>Simule seu orçamento gratuitamente</p>
      <Calculadora />
    </div>
  );
}