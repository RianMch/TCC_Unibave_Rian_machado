import {Router} from "express";
import type {Request,Response} from "express";
import { autenticar,exigirRole } from "../middleware/auth.js";
import { calcularPreco,criarPedido,agendarPedido,listarPedidosUsuario,listarTodosPedidos } from "../model/pedido.js";
import { atualizarStatus,concluirPedido } from "../model/status.js";
import type {Material, Turno} from "@prisma/client";

const router = Router();

router.post("/simular",(req:Request,res:Response)=>{
    const {largura,altura,material}=req.body;
    const resultado = calcularPreco(largura,altura,material as Material);
    res.json(resultado);
});
router.post("/criar",autenticar,async (req:Request,res:Response)=>{
    const {largura,altura,material}=req.body;
    const pedido =await criarPedido(
        req.usuario!.id,
        largura,
        altura,
        material as Material
    );
    res.status(201).json(pedido)
});
router.post("/agendar/:id",autenticar,async(req:Request, res:Response)=>{
    const {dataAgendada,turno}=req.body;
    try{
        const pedido =await agendarPedido(
            Number(req.params["id"]),
            new Date(dataAgendada),
            turno as Turno
        );

    }catch(erro){
        res.status(409).json({erro:"Horário indisponível"})

    }
});


router.get("/meus-pedidos",autenticar, async(req:Request,res:Response)=>{
    const pedidos = await listarPedidosUsuario(req.usuario!.id);
    res.json(pedidos);
});


router.get("/todos",autenticar,exigirRole("ADMIN","TECNICO"),async(req:Request,res:Response)=>{
    const {status}=req.body;
    const pedido = await listarTodosPedidos();
    res.json(pedido);
});
router.get("/status/:id",autenticar,exigirRole("ADMIN","TECNICO"),async(req:Request,res:Response)=>{
    const {status}=req.body;
    const pedido = await atualizarStatus(Number(req.params["id"]),status);
    res.json(pedido);
});

router.get("/concluir/:id",autenticar,exigirRole("ADMIN","TECNICO"),async(req:Request,res:Response)=>{
    const {status}=req.body;
    const pedido = await concluirPedido(Number(req.params["id"]));
    res.json(pedido);
});
export default router;