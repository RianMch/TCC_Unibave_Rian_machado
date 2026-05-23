import "dotenv/config";
import prisma from "../lib/prisma.js";
import type { StatusOS } from "@prisma/client";

export async function atualizarStatus(pedidoId: number, status: StatusOS) {
  return await prisma.pedido.update({
    where: { id: pedidoId },
    data: { status },
  });
}

export async function concluirPedido(pedidoId: number) {
  const pedido = await atualizarStatus(pedidoId, "CONCLUIDA");

  const validoAte = new Date(pedido.criadoEm);
  validoAte.setFullYear(validoAte.getFullYear() + 3);

  const certificado = await prisma.certificado.create({
    data: {
      pedidoId,
      codigo: `RDSEG-${new Date().getFullYear()}-${String(pedidoId).padStart(4, "0")}`,
      validoAte,
    },
  });

  return { pedido, certificado };
}