import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./src/router/auth.js";
import pedidosRouter from "./src/router/pedidos.js";
import { tratarErros } from "./src/middleware/errorHandler.js";


const app = express();
const port = process.env["PORT"] ?? 3000;

const trustProxy = process.env["TRUST_PROXY"];
if (trustProxy) {
  const hops = Number(trustProxy);
  app.set("trust proxy", Number.isNaN(hops) ? trustProxy : hops);
}

const origensPermitidas = (process.env["FRONTEND_URL"] ?? "http://localhost:5173")
  .split(",")
  .map((origem) => origem.trim());

app.use(cors({
  origin: origensPermitidas,
  credentials: true
}));

app.use(express.json());    
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/pedidos", pedidosRouter);

app.get("/api/status", (req, res) => {
  res.json({ status: "ok", mensagem: "servidor rodando" });
});

app.use(tratarErros);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});