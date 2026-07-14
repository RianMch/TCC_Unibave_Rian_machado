import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

export function tratarErros(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
 
  if (res.headersSent) {
    next(err);
    return;
  }
  console.error(`[erro] ${req.method} ${req.originalUrl}:`, err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {

    if (err.code === "P2025") {
      res.status(404).json({ erro: "Registro não encontrado" });
      return;
    }
 
    if (err.code === "P2002") {
      res.status(409).json({ erro: "Conflito: o registro já existe" });
      return;
    }
  }

  res.status(500).json({ erro: "Erro interno do servidor" });
}