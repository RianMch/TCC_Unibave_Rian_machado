-- CreateIndex
-- Garante, a nível de banco, que não existam dois pedidos com o mesmo
-- par (dataAgendada, turno). Isso fecha a race condition que existia
-- no agendamento: antes, duas requisições concorrentes podiam passar
-- pela checagem de conflito da aplicação ao mesmo tempo e ambas
-- conseguirem agendar o mesmo horário. Agora, mesmo que isso aconteça,
-- só uma das duas passa pelo banco — a outra recebe um erro de
-- violação de constraint (P2002), tratado em src/model/pedido.ts.
CREATE UNIQUE INDEX "Pedido_dataAgendada_turno_key" ON "Pedido"("dataAgendada", "turno");
 