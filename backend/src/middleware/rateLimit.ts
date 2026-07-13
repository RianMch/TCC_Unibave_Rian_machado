import rateLimit from "express-rate-limit";

/**
 * Login: alvo típico de força bruta (tentar várias senhas para um mesmo
 * e-mail, ou testar credenciais vazadas em vários e-mails). Janela curta
 * e limite baixo por IP.
 */
export const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 10,
  standardHeaders: true, // devolve RateLimit-* nos headers da resposta
  legacyHeaders: false,
  message: { erro: "Muitas tentativas de login. Tente novamente em alguns minutos." },
});

/**
 * Registro: alvo de criação em massa de contas (bots, spam). Janela mais
 * longa, limite um pouco mais folgado que o login.
 */
export const limiteRegistro = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: "Muitas tentativas de cadastro. Tente novamente mais tarde." },
});