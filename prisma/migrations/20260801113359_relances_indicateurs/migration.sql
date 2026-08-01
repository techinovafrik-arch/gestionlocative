-- AlterTable
ALTER TABLE "factures" ADD COLUMN     "alerte_echeance_envoyee" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "relance_impaye_envoyee" BOOLEAN NOT NULL DEFAULT false;
