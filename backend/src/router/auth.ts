import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { criarUser, buscarPorEmail } from "../model/user.js";
import { autenticar } from "../middleware/auth.js";

const router = Router();
const SEGREDO = process.env["JWT_SECRET"]!;

router.post("/register", async (req: Request, res: Response) => {
  const { nome, email, senha } = req.body;
  const existe = await buscarPorEmail(email);
  if (existe) {
    res.status(400).json({ erro: "Email já cadastrado" });
    return;
  }
  const usuario = await criarUser(nome, email, senha);
  res.status(201).json({ mensagem: "Usuário criado com sucesso", id: usuario.id });
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, senha } = req.body;
  const usuario = await buscarPorEmail(email);
  if (!usuario) {
    res.status(401).json({ erro: "Usuário não encontrado" });
    return;
  }
  const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
  if (!senhaCorreta) {
    res.status(401).json({ erro: "Senha incorreta" });
    return;
  }

  // ✅ adicionado role no token
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

  // ✅ adicionado id na resposta
  res.json({ mensagem: "Login realizado com sucesso", role: usuario.role, id: usuario.id });
});

// ✅ logout fora do login
router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ mensagem: "Logout realizado com sucesso" });
});

router.get("/me", autenticar, (req: Request, res: Response) => {
  res.json({ id: req.usuario!.id, role: req.usuario!.role });
});

export default router;