export interface Usuario{
    id:string;
    nome:string;
    email:string;
    senha:string;
    telefone:string;
    funcao:'CLIENTE'|'ADMIN'|'TECNICO';
    criadoEm:Date;

}