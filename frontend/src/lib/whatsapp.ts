import { moeda, numero } from "./formato";

/** Número do WhatsApp da empresa (só dígitos, com 55). Vem do .env do front. */
export const WHATSAPP_EMPRESA: string | undefined = import.meta.env.VITE_WHATSAPP_EMPRESA;

/**
 * Normaliza um telefone brasileiro para o formato do wa.me (55 + DDD + número).
 * Aceita com ou sem 55. Devolve null se não parecer um telefone válido.
 */
export function numeroParaWhatsapp(telefone: string | null | undefined): string | null {
  const d = (telefone ?? "").replace(/\D/g, "");
  if (d.length === 10 || d.length === 11) return `55${d}`;
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) return d;
  return null;
}

/** Link do WhatsApp; sem número válido, abre o seletor de contato com o texto pronto. */
export function linkWhatsapp(telefone: string | null | undefined, texto: string): string {
  const numero = numeroParaWhatsapp(telefone);
  const base = numero ? `https://wa.me/${numero}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(texto)}`;
}

export function abrirWhatsapp(telefone: string | null | undefined, texto: string) {
  window.open(linkWhatsapp(telefone, texto), "_blank", "noopener");
}

const tipoNome = (t: string) => (t === "SACADA" ? "Sacada" : "Campo");
const materialNome = (m: string) => m.charAt(0) + m.slice(1).toLowerCase();
const os = (id: number) => `OS #${String(id).padStart(4, "0")}`;

interface DadosSolicitacao {
  id?: number;
  tipoInstalacao: string;
  largura: number;
  altura: number;
  cep?: string;
  estimativa?: { nome: string; total: number }[];
  area?: number;
}

/** Cliente -> empresa. */
export function mensagemClienteParaEmpresa(d: DadosSolicitacao): string {
  const linhas = [
    d.id
      ? `Olá! Acabei de solicitar um orçamento (${os(d.id)}) para rede de proteção.`
      : "Olá! Gostaria de solicitar um orçamento para rede de proteção.",
    `Tipo de instalação: ${tipoNome(d.tipoInstalacao)}`,
    `Dimensões aproximadas: ${d.largura} m (largura) x ${d.altura} m (altura)`,
    d.cep ? `CEP: ${d.cep}` : "",
    ...(d.estimativa?.length
      ? [
          `Estimativa simulada${d.area ? ` (${numero(d.area, 2)} m²)` : ""}:`,
          ...d.estimativa.map(m => `- ${m.nome}: ${moeda(m.total)}`),
        ]
      : []),
  ];
  return linhas.filter(Boolean).join("\n");
}

interface DadosOrcamento {
  nomeCliente: string;
  id: number;
  tipoInstalacao: string;
  largura: number;
  altura: number;
  area: number;
  material: string;
  precoTotal: number;
}

/** Empresa -> cliente: orçamento definitivo. */
export function mensagemOrcamentoParaCliente(d: DadosOrcamento): string {
  return [
    `Olá, ${d.nomeCliente}! Segue o orçamento definitivo da sua solicitação (${os(d.id)}) – Redes de Proteção:`,
    `Tipo de instalação: ${tipoNome(d.tipoInstalacao)}`,
    `Medidas: ${d.largura} m x ${d.altura} m (${numero(d.area, 2)} m²)`,
    `Material: ${materialNome(d.material)}`,
    `Valor total: ${moeda(d.precoTotal)}`,
    "",
    "Se estiver tudo certo, é só responder aqui para confirmarmos e agendarmos a instalação.",
  ].join("\n");
}

/** Cliente -> empresa, a partir de um pedido já existente. */
export function mensagemSobrePedido(p: {
  id: number;
  tipoInstalacao: string;
  largura: number;
  altura: number;
  material: string | null;
  precoTotal: number | null;
}): string {
  return [
    `Olá! Gostaria de falar sobre a ${os(p.id)}.`,
    `Tipo de instalação: ${tipoNome(p.tipoInstalacao)}`,
    `Medidas: ${p.largura} m x ${p.altura} m`,
    p.material ? `Material: ${materialNome(p.material)}` : "",
    p.precoTotal != null ? `Valor: ${moeda(p.precoTotal)}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
