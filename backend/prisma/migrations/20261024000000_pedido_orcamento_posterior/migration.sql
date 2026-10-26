-- Alinha o banco ao schema atual: o cliente solicita só com medidas/tipo e o
-- admin define material e preço depois. Idempotente (seguro se o banco já foi
-- ajustado manualmente ou com `prisma db push`).

DO $$ BEGIN
  CREATE TYPE "TipoInstalacao" AS ENUM ('SACADA', 'CAMPO');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "tipoInstalacao" "TipoInstalacao" NOT NULL DEFAULT 'SACADA';
ALTER TABLE "Pedido" ADD COLUMN IF NOT EXISTS "cep" TEXT;
ALTER TABLE "Pedido" ALTER COLUMN "material" DROP NOT NULL;
ALTER TABLE "Pedido" ALTER COLUMN "precoTotal" DROP NOT NULL;
