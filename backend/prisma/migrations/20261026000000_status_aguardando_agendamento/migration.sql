-- Novo status: o cliente confirmou o orçamento pelo WhatsApp e o pedido aguarda
-- o admin definir data e turno. (Idempotente.)
ALTER TYPE "StatusOS" ADD VALUE IF NOT EXISTS 'AGUARDANDO_AGENDAMENTO' AFTER 'PENDENTE';
