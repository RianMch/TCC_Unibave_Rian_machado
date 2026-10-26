import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { criarUser, buscarPorEmail } from "../model/user.js";
import { autenticar } from "../middleware/auth.js";
import { validarBody } from "../middleware/validar.js";
import { limiteLogin, limiteRegistro } from "../middleware/rateLimit.js";
import { registrarSchema, loginSchema } from "../validation/schemas.js";

const router = Router();
const SEGREDO = process.env["JWT_SECRET"]!;

router.post("/register", limiteRegistro, validarBody(registrarSchema), async (req: Request, res: Response) => {
  const { nome, email, senha, telefone } = req.body;
  const existe = await buscarPorEmail(email);
  if (existe) {
    res.status(400).json({ erro: "Email já cadastrado" });
    return;
  }
  const usuario = await criarUser(nome, email, senha, telefone);
  res.status(201).json({ mensagem: "Usuário criado com sucesso", id: usuario.id });
});

router.post("/login", limiteLogin, validarBody(loginSchema), async (req: Request, res: Response) => {
  const { email, senha } = req.body;
  const usuario = await buscarPorEmail(email);
  const HASH_INEXISTENTE = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8gh0OWr1rBnbAIm6nDmC5B3AGoAqbe";
  const senhaCorreta = await bcrypt.compare(senha, usuario?.senha ?? HASH_INEXISTENTE);

  if (!usuario || !senhaCorreta) {
    res.status(401).json({ erro: "Email ou senha incorretos" });
    return;
  }

  const token = jwt.sign(
    { id: usuario.id, role: usuario.role },
    SEGREDO,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ mensagem: "Login realizado com sucesso", role: usuario.role, id: usuario.id });
});

// --- NOVO: Rota para solicitação de recuperação de senha ---
router.post("/esqueceu-senha", async (req: Request, res: Response) => {
  const { email } = req.body;
  
  try {
    const usuario = await buscarPorEmail(email);

    // Por segurança, respondemos com sucesso mesmo se o e-mail não existir
    // para evitar que pessoas descubram quais e-mails estão cadastrados.
    if (!usuario) {
      res.status(200).json({ mensagem: "Se o e-mail estiver cadastrado, as instruções foram enviadas." });
      return;
    }

    // Aqui futuramente você pode adicionar a lógica de enviar um e-mail de redefinição
    // (ex: gerando um token temporário e disparando um serviço de e-mail).

    res.status(200).json({ mensagem: "Se o e-mail estiver cadastrado, as instruções foram enviadas." });
  } catch (error) {
    res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ mensagem: "Logout realizado com sucesso" });
});

router.get("/me", autenticar, (req: Request, res: Response) => {
  res.json({ id: req.usuario!.id, role: req.usuario!.role });
});

export default router;