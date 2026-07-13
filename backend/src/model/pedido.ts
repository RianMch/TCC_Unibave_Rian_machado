import "dotenv/config";
import prisma from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import type { Material, Turno } from "@prisma/client";

const PRECOS = {
  POLIETILENO: 140,
  POLIAMIDA: 110,
};

export function calcularPreco(largura: number, altura: number, material: Material) {
  const area = largura * altura;
  const preco = area * PRECOS[material];
  return { area, preco };
}

export async function criarPedido(
  usuarioId: number,
  largura: number,
  altura: number,
  material: Material
) {
  const { area, preco } = calcularPreco(largura, altura, material);

  return await prisma.pedido.create({
    data: {
      usuarioId,
      largura,
      altura,
      area,
      material,
      precoTotal: preco,
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
    // P2002 = violação de constraint única (dataAgendada, turno já ocupados).
    // O banco garante isso atomicamente, então não existe mais uma janela
    // entre "checar se está livre" e "reservar" onde duas requisições
    // simultâneas poderiam agendar o mesmo horário.
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
    include: { usuario: { select: { nome: true, email: true } } },
    orderBy: { criadoEm: "desc" },
  });
}