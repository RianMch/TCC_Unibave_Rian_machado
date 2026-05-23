import type { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";

interface tokenPayload{
    id:number;
    role:string;
}

declare global {
    namespace Express {
        interface Request {
            usuario?:tokenPayload;
        }
    }

}

export function autenticar(req:Request,res:Response,next:NextFunction){
    const token = req.cookies["token"];


    if(!token){
        res.status(401).json({erro:"não autorizado"})
        return;
    }

    try{
        const payload = jwt.verify(token, process.env["JWT_SECRET"]!) as tokenPayload;
        req.usuario = payload;
        next();
    }catch(err){
        res.status(401).json({erro:"não autorizado"});
    }
}

export function exigirRole(...roles:string[]){
    return(req:Request,res:Response,next:NextFunction)=>{
        if(!req.usuario|| !roles.includes(req.usuario.role)){
            res.status(403).json({erro:"acesso negado"});
        }else{
            next();
        }
    }
}