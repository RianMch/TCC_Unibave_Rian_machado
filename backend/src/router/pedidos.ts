import { Router } from "express";
import type { Request, Response } from "express";
import { autenticar, exigirRole } from "../middleware/auth.js";
import { validarBody, validarParams } from "../middleware/validar.js";
import {
  simularSchema,
  simularComDistanciaSchema,
  criarPedidoSchema,
  agendarSchema,
  statusSchema,
  orcamentoSchema,
  idParamSchema,
} from "../validation/schemas.js";
import { calcularPreco, criarPedido, agendarPedido, confirmarOrcamento, atualizarPedidoAdmin, listarPedidosUsuario, listarTodosPedidos } from "../model/pedido.js";
import { atualizarStatus, concluirPedido } from "../model/status.js";
import type { Material, Turno, TipoInstalacao } from "@prisma/client";
import axios from "axios";

const router = Router();

router.post("/simular-com-distancia", validarBody(simularComDistanciaSchema), async (req: Request, res: Response) => {
  const { largura, altura, material, tipoInstalacao, cep } = req.body;
  const PRECOS: Record<string, number> = { POLIETILENO: 140, POLIAMIDA: 110 };
  const area = largura * altura;
  const preco = area * (PRECOS[material] ?? 140);

  const ORS_KEY = process.env["ORS_API_KEY"]!;
  const ORS_HEADERS = { Authorization: `Bearer ${ORS_KEY}` };

  try {
    const viaCep = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    if (viaCep.data.erro) {
      res.status(400).json({ erro: "CEP não encontrado" });
      return;
    }

    const enderecoCliente = `${viaCep.data.logradouro}, ${viaCep.data.localidade}, ${viaCep.data.uf}`;

    const geoCliente = await axios.get("https://api.openrouteservice.org/geocode/search", {
      headers: ORS_HEADERS,
      params: { text: enderecoCliente, size: 1 },
    });

    const geoEmpresa = await axios.get("https://api.openrouteservice.org/geocode/search", {
      headers: ORS_HEADERS,
      params: { text: process.env["ENDERECO_EMPRESA"], size: 1 },
    });

    const coordCliente = geoCliente.data.features[0].geometry.coordinates;
    const coordEmpresa = geoEmpresa.data.features[0].geometry.coordinates;

    const rota = await axios.get("https://api.openrouteservice.org/v2/directions/driving-car", {
      headers: ORS_HEADERS,
      params: {
        start: `${coordEmpresa[0]},${coordEmpresa[1]}`,
        end: `${coordCliente[0]},${coordCliente[1]}`,
      },
    });

    const distanciaMetros = rota.data.features[0].properties.segments[0].distance;
    const distanciaKm = distanciaMetros / 1000;
    const PRECO_LITRO = 6.50;
    const CONSUMO_KM_L = 10;
    const custoGasolina = (distanciaKm * 2 / CONSUMO_KM_L) * PRECO_LITRO;
    const custoTotal = preco + custoGasolina;

    res.json({
      area,
      preco,
      tipoInstalacao,
      distanciaKm,
      custoGasolina: Math.round(custoGasolina * 100) / 100,
      custoTotal: Math.round(custoTotal * 100) / 100,
    });
  } catch (e) {
    if (axios.isAxiosError(e)) {
      console.error("ERRO API:", e.response?.status, JSON.stringify(e.response?.data));
    } else {
      console.error("ERRO GERAL:", e);
    }
    res.status(500).json({ erro: "Erro ao calcular distância" });
  }
});

router.post("/simular", validarBody(simularSchema), (req: Request, res: Response) => {
  const { largura, altura, material } = req.body;
  const resultado = calcularPreco(largura, altura, material as Material);
  res.json(resultado);
});

// ✅ Alterado de "/criar" para "/" para corresponder exatamente a POST /api/pedidos
router.post("/", autenticar, validarBody(criarPedidoSchema), async (req: Request, res: Response) => {
  const { largura, altura, tipoInstalacao } = req.body;
  const pedido = await criarPedido(req.usuario!.id, largura, altura, tipoInstalacao as TipoInstalacao);
  res.status(201).json(pedido);
});

// Só o admin agenda, e só depois de o cliente confirmar o orçamento pelo WhatsApp.
router.post(
  "/agendar/:id",
  autenticar,
  exigirRole("ADMIN"),
  validarParams(idParamSchema),
  validarBody(agendarSchema),
  async (req: Request, res: Response) => {
    const { dataAgendada, turno } = req.body;
    const pedido = await agendarPedido(Number(req.params["id"]), new Date(dataAgendada), turno as Turno);
    res.json(pedido);
  }
);

// Admin registra que o cliente confirmou o orçamento: PENDENTE -> AGUARDANDO_AGENDAMENTO.
router.patch(
  "/confirmar/:id",
  autenticar,
  exigirRole("ADMIN"),
  validarParams(idParamSchema),
  async (req: Request, res: Response) => {
    const pedido = await confirmarOrcamento(Number(req.params["id"]));
    res.json(pedido);
  }
);

router.get("/meus-pedidos", autenticar, async (req: Request, res: Response) => {
  const pedidos = await listarPedidosUsuario(req.usuario!.id);
  res.json(pedidos);
});

router.get("/todos", autenticar, exigirRole("ADMIN", "TECNICO"), async (req: Request, res: Response) => {
  const pedidos = await listarTodosPedidos();
  res.json(pedidos);
});

router.patch(
  "/status/:id",
  autenticar,
  exigirRole("ADMIN", "TECNICO"),
  validarParams(idParamSchema),
  validarBody(statusSchema),
  async (req: Request, res: Response) => {
    const { status } = req.body;
    const pedido = await atualizarStatus(Number(req.params["id"]), status);
    res.json(pedido);
  }
);

router.patch(
  "/concluir/:id",
  autenticar,
  exigirRole("ADMIN", "TECNICO"),
  validarParams(idParamSchema),
  async (req: Request, res: Response) => {
    const pedido = await concluirPedido(Number(req.params["id"]));
    res.json(pedido);
  }
);

// Admin define o material e o valor definitivo do orçamento de um pedido.
// Depois disso o cliente vê material e total no painel e o admin envia pelo WhatsApp.
router.patch(
  "/orcamento/:id",
  autenticar,
  exigirRole("ADMIN"),
  validarParams(idParamSchema),
  validarBody(orcamentoSchema),
  async (req: Request, res: Response) => {
    const { material, precoTotal } = req.body;
    const pedido = await atualizarPedidoAdmin(Number(req.params["id"]), material as Material, precoTotal);
    res.json(pedido);
  }
);

export default router;