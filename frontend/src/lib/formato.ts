export const moeda = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const numero = (v: number, casas: number) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

/** Converte o que o admin digitou ("1.234,56", "R$ 980", "980.5") em número. */
export function lerPreco(texto: string): number | null {
  let t = texto.replace(/R\$|\s/g, "");
  if (!t) return null;
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "");
  if (!/^\d+(\.\d+)?$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}
