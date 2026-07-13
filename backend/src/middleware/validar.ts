import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

/**
 * Valida req.body contra um schema zod.
 * Em caso de falha, responde 400 com a lista de erros e interrompe a rota.
 * Em caso de sucesso, substitui req.body pelo dado já validado/tipado
 * (zod aplica coerções e remove campos não declarados no schema).
 */
export function validarBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      res.status(400).json({
        erro: "Dados inválidos",
        detalhes: resultado.error.issues.map((i) => ({
          campo: i.path.join("."),
          mensagem: i.message,
        })),
      });
      return;
    }

    req.body = resultado.data;
    next();
  };
}

/**
 * Valida req.params contra um schema zod (ex.: garantir que :id é numérico).
 */
export function validarParams(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req.params);

    if (!resultado.success) {
      res.status(400).json({
        erro: "Parâmetros inválidos",
        detalhes: resultado.error.issues.map((i) => ({
          campo: i.path.join("."),
          mensagem: i.message,
        })),
      });
      return;
    }

    req.params = resultado.data as typeof req.params;
    next();
  };
}