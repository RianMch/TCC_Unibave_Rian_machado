-- AlterTable
-- Telefone do cliente (somente dígitos, DDD + número, sem o 55). Opcional para não
-- afetar usuários já cadastrados; usado para o admin enviar o orçamento pelo WhatsApp.
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "telefone" TEXT;
