import axios from "axios";

// Em dev cai para localhost:3000/api. Em produção, defina VITE_API_URL no build.
const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

const api = axios.create({
  baseURL,
  // OBRIGATÓRIO: a sessão é um cookie httpOnly emitido pelo backend (porta 3000)
  // para um front em outra origem (porta 5173). Sem isso o navegador descarta o
  // cookie do login e não o envia nas chamadas seguintes: o login "funciona",
  // mas /auth/me e /pedidos/* respondem 401.
  withCredentials: true,
});

export default api;
