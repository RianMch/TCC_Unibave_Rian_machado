import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./src/router/auth.js";
import pedidosRouter from "./src/router/pedidos.js";


const app = express();
const port = process.env["PORT"] ?? 3000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());    
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/pedidos", pedidosRouter);

app.get("/api/status", (req, res) => {
  res.json({ status: "ok", mensagem: "servidor rodando" });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});