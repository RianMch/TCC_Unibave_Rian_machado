import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

export async function criarUser(nome: string, email: string, senhaPlana: string) {
  const saltRounds = 10;
  const senhaHash = await bcrypt.hash(senhaPlana, saltRounds);

  // Cria o usuário usando o Prisma corretamente
  const usuario = await prisma.usuario.create({
    data: {
      nome,
      email,
      senha: senhaHash, // Salva o hash gerado pelo bcrypt
        // Adicione uma role padrão se o seu schema exigir (ex: "USER" ou "ADMIN")
    },
  });

  return { id: usuario.id };
}

export async function buscarPorEmail(email: string) {
  return await prisma.usuario.findUnique({
    where: {
      email,
    },
  });
}