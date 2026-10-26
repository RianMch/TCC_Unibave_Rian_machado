import { z } from "zod";

// Mesmos valores dos enums do schema.prisma
const MATERIAIS = ["POLIETILENO", "POLIAMIDA"] as const;
const TIPOS_INSTALACAO = ["SACADA", "CAMPO"] as const; 
const TURNOS = ["MANHA", "TARDE"] as const;
const STATUS = ["PENDENTE", "AGUARDANDO_AGENDAMENTO", "AGENDADA", "EM_EXECUCAO", "CONCLUIDA"] as const;

// Dimensões físicas de uma rede de proteção
const dimensao = z
  .number({ error: "Deve ser um número" })
  .positive("Deve ser maior que zero")
  .max(30, "Valor acima do limite permitido (30m)");

// Telefone brasileiro: aceita "(48) 99999-9999", "48999999999" ou "+55 48 99999-9999".
// Guarda só os dígitos (DDD + número, sem o 55): 10 (fixo) ou 11 (celular).
const telefone = z
  .string({ error: "Telefone é obrigatório" })
  .transform((valor) => {
    const digitos = valor.replace(/\D/g, "");
    return (digitos.length === 12 || digitos.length === 13) && digitos.startsWith("55")
      ? digitos.slice(2)
      : digitos;
  })
  .refine((digitos) => digitos.length === 10 || digitos.length === 11, "Telefone inválido, use DDD + número");

export const registrarSchema = z.object({
  nome: z
    .string({ error: "Nome é obrigatório" })
    .trim()
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(120, "Nome muito longo"),
  email: z
    .string({ error: "Email é obrigatório" })
    .trim()
    .toLowerCase()
    .email("Email inválido"),
  senha: z
    .string({ error: "Senha é obrigatória" })
    .min(6, "Senha deve ter ao menos 6 caracteres")
    .max(72, "Senha muito longa"), // bcrypt ignora além de 72 bytes
  telefone,
});

export const loginSchema = z.object({
  email: z.string({ error: "Email é obrigatório" }).trim().toLowerCase().email("Email inválido"),
  senha: z.string({ error: "Senha é obrigatória" }).min(1, "Senha é obrigatória"),
});

export const simularSchema = z.object({
  largura: dimensao,
  altura: dimensao,
  material: z.enum(MATERIAIS, { error: "Material inválido" }),
  tipoInstalacao: z.enum(TIPOS_INSTALACAO, { error: "Tipo de instalação inválido" }),
});

export const simularComDistanciaSchema = simularSchema.extend({
  cep: z
    .string({ error: "CEP é obrigatório" })
    .trim()
    .regex(/^\d{5}-?\d{3}$/, "CEP inválido, use o formato 00000-000"),
});

// ✅ Pedido criado pelo cliente exige apenas largura, altura e tipo de instalação (sem material)
export const criarPedidoSchema = z.object({
  largura: dimensao,
  altura: dimensao,
  tipoInstalacao: z.enum(TIPOS_INSTALACAO, { error: "Tipo de instalação inválido" }),
});

export const agendarSchema = z.object({
  dataAgendada: z
    .string({ error: "Data é obrigatória" })
    .refine((valor) => !Number.isNaN(Date.parse(valor)), "Data inválida")
    .refine((valor) => {
      const data = new Date(valor);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      return data >= hoje;
    }, "A data não pode estar no passado"),
  turno: z.enum(TURNOS, { error: "Turno inválido" }),
});

export const statusSchema = z.object({
  status: z.enum(STATUS, { error: "Status inválido" }),
});

export const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "Id deve ser um número")
    .transform(Number),
});

// Orçamento definitivo lançado pelo admin: material que será usado + valor final (R$).
export const orcamentoSchema = z.object({
  material: z.enum(MATERIAIS, { error: "Material inválido" }),
  precoTotal: z
    .number({ error: "Valor deve ser um número" })
    .positive("Valor deve ser maior que zero")
    .max(1_000_000, "Valor acima do limite permitido")
    .transform((valor) => Math.round(valor * 100) / 100),
});
