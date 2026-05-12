export interface ICatalogoProduto {
    id: number;
    nome: string;
    tipo: "corte nobre" | "subprodutos"|"descarte";
    redimento_padrao_percentual: number;
}