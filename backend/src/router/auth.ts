import {Router} from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { criarUser, buscarPorEmail } from "../model/user.js";
const router = Router();
const SEGREDO = process.env["JWT_SECRET"]!;
router.post("/register",async(req,res)=>{
    const{nome, email,senha}=req.body;
    const existe=await buscarPorEmail(email);
    if(existe){
        res.status(400).json({erro:"Email já cadastrado"});
        return;
    }
    const usuario=await criarUser(nome,email,senha);
    res.status(201).json({mensagem:"Usuário criado com sucesso",id:usuario.id});
});
router.post("/login",async(req,res)=>{
    const{email,senha}=req.body;
    const usuario=await buscarPorEmail(email);
    if(!usuario){
        res.status(401).json({erro:"Usuário não encontrado"});
        return;
    }
    const senhaCorreta=await bcrypt.compare(senha,usuario.senha);
    if(!senhaCorreta){
        res.status(401).json({erro:"Senha incorreta"});
        return;
    }
    const token=jwt.sign({id:usuario.id},SEGREDO,{expiresIn:"1h"});
    res.cookie("token",token,{
        httpOnly:true,
        sameSite:"strict",
        maxAge:3600000
    });
    res.json({mensagem:"Login realizado com sucesso",role:usuario.role})

    router.post("/logout",async(req,res)=>{
        res.clearCookie("token");
        res.json({mensagem:"Logout realizado com sucesso"});
    });
});
export default router;

