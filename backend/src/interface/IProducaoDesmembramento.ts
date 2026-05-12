export interface IProducaoDesmembramento{
    id: number;
    recebimento_material_prima_id:number;
    produto_catalogo_id: number;
    peso_saida: number;
    destino:"venda Direta"|"Processamento Interno"|"Descarte";
    data: Date;
    quantidade_produzida: number;
}