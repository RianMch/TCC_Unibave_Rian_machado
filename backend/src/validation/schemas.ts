import { z } from "zod";

// Mesmos valores dos enums do schema.prisma (Material, Turno, StatusOS).
// Repetidos aqui em vez de importados do @prisma/client porque o zod
// precisa dos valores em tempo de definição do schema, e assim evitamos
// acoplar a validação de entrada ao client gerado do Prisma.
const MATERIAIS = ["POLIETILENO", "POLIAMIDA"] as const;
const TURNOS = ["MANHA", "TARDE"] as const;
const STATUS = ["PENDENTE", "AGENDADA", "EM_EXECUCAO", "CONCLUIDA"] as const;

// Dimensões físicas de uma rede de proteção: precisam ser positivas e
// dentro de uma faixa plausível (evita valores absurdos tipo 0, negativo
// ou 99999 que quebrariam o orçamento ou o banco).
const dimensao = z
  .number({ error: "Deve ser um número" })
  .positive("Deve ser maior que zero")
  .max(30, "Valor acima do limite permitido (30m)");

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
});

export const loginSchema = z.object({
  email: z.string({ error: "Email é obrigatório" }).trim().toLowerCase().email("Email inválido"),
  senha: z.string({ error: "Senha é obrigatória" }).min(1, "Senha é obrigatória"),
});

export const simularSchema = z.object({
  largura: dimensao,
  altura: dimensao,
  material: z.enum(MATERIAIS, { error: "Material inválido" }),
});

export const simularComDistanciaSchema = simularSchema.extend({
  cep: z
    .string({ error: "CEP é obrigatório" })
    .trim()
    .regex(/^\d{5}-?\d{3}$/, "CEP inválido, use o formato 00000-000"),
});

export const criarPedidoSchema = simularSchema;

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