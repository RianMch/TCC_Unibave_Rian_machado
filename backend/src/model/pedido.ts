import "dotenv/config";
import prisma from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import type { Material, Turno, TipoInstalacao } from "@prisma/client";

// Tipado explicitamente com Record para evitar erros de indexação com o Material
const PRECOS: Record<Material, number> = {
  POLIETILENO: 140,
  POLIAMIDA: 110,
};

export function calcularPreco(largura: number, altura: number, material: Material) {
  const area = largura * altura;
  const preco = area * PRECOS[material];
  return { area, preco };
}

// Criado pelo cliente na tela inicial (sem material e sem preço pré-definidos)
export async function criarPedido(
  usuarioId: number,
  largura: number,
  altura: number,
  tipoInstalacao: TipoInstalacao
) {
  const area = largura * altura;

  return await prisma.pedido.create({
    data: {
      usuarioId,
      largura,
      altura,
      area,
      tipoInstalacao,
      status: "PENDENTE",
      // Material e precoTotal ficam opcionais/nulos até o admin definir no painel
    },
  });
}

// Função para o Admin atualizar/completar o pedido (definir material, preço e calcular mão de obra)
export async function atualizarPedidoAdmin(
  pedidoId: number,
  material: Material,
  precoTotal: number
) {
  return await prisma.pedido.update({
    where: { id: pedidoId },
    data: {
      material,
      precoTotal,
    },
  });
}

export async function agendarPedido(
  pedidoId: number,
  dataAgendada: Date,
  turno: Turno
) {
  try {
    return await prisma.pedido.update({
      where: { id: pedidoId },
      data: { dataAgendada, turno, status: "AGENDADA" },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new Error("Horário indisponível");
    }
    throw e;
  }
}

export async function listarPedidosUsuario(usuarioId: number) {
  return await prisma.pedido.findMany({
    where: { usuarioId },
    orderBy: { criadoEm: "desc" },
  });
}

export async function listarTodosPedidos() {
  return await prisma.pedido.findMany({
    include: { usuario: { select: { nome: true, email: true, telefone: true } } },
    orderBy: { criadoEm: "desc" },
  });
}