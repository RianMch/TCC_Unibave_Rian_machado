import prisma from  "../lib/prisma.js"
import bcrypt from "bcrypt";
export async function criarUser(nome:string,email:string,senha:string){
    const senhaHast = await bcrypt.hash(senha,10);
    const usuario = await prisma.usuario.create({
        data:{
            nome,
            email,
            senha:senhaHast
        }
    });
    return usuario;
}
export async function buscarPorEmail(email:string){
    return await prisma.usuario.findUnique({
        where:{
            email
        }
    });
}