-- CreateEnum
CREATE TYPE "TypeBien" AS ENUM ('maison', 'villa', 'appartement', 'studio', 'chambre', 'bureau', 'magasin', 'entrepot', 'terrain', 'immeuble', 'local_commercial');

-- CreateEnum
CREATE TYPE "StatutBien" AS ENUM ('libre', 'occupe', 'en_travaux');

-- CreateEnum
CREATE TYPE "TypeLocataire" AS ENUM ('physique', 'entreprise');

-- CreateEnum
CREATE TYPE "StatutLocataire" AS ENUM ('actif', 'archive');

-- CreateEnum
CREATE TYPE "TypePieceIdentite" AS ENUM ('passeport', 'cni', 'carte_consulaire', 'permis');

-- CreateEnum
CREATE TYPE "Periodicite" AS ENUM ('mensuelle', 'trimestrielle', 'annuelle');

-- CreateEnum
CREATE TYPE "StatutContrat" AS ENUM ('brouillon', 'actif', 'resilie', 'termine');

-- CreateEnum
CREATE TYPE "StatutCaution" AS ENUM ('detenue', 'remboursee', 'remboursee_avec_retenue');

-- CreateEnum
CREATE TYPE "StatutFacture" AS ENUM ('emise', 'partiellement_payee', 'payee', 'impayee');

-- CreateEnum
CREATE TYPE "ModePaiement" AS ENUM ('especes', 'virement', 'cheque', 'orange_money', 'mtn_money', 'moov_money', 'wave');

-- CreateEnum
CREATE TYPE "StatutPaiement" AS ENUM ('valide', 'corrige', 'annule');

-- CreateEnum
CREATE TYPE "EntiteDocument" AS ENUM ('bien', 'locataire', 'contrat', 'facture');

-- CreateEnum
CREATE TYPE "ProfilUtilisateur" AS ENUM ('administrateur', 'gerant', 'gestionnaire', 'consultation');

-- CreateEnum
CREATE TYPE "TypeNotification" AS ENUM ('information', 'alerte', 'action_requise');

-- CreateEnum
CREATE TYPE "CanalNotification" AS ENUM ('interne', 'email', 'sms', 'whatsapp');

-- CreateTable
CREATE TABLE "communes" (
    "id" UUID NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "communes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quartiers" (
    "id" UUID NOT NULL,
    "commune_id" UUID NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quartiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biens" (
    "id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "type" "TypeBien" NOT NULL,
    "designation" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "quartier_id" UUID NOT NULL,
    "adresse" VARCHAR(255) NOT NULL,
    "loyer" DECIMAL(12,0) NOT NULL,
    "charges_mensuelles" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "statut" "StatutBien" NOT NULL DEFAULT 'libre',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "biens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locataires" (
    "id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "type" "TypeLocataire" NOT NULL,
    "civilite" VARCHAR(10),
    "nom" VARCHAR(100),
    "prenoms" VARCHAR(150),
    "date_naissance" DATE,
    "nationalite" VARCHAR(60),
    "profession" VARCHAR(100),
    "raison_sociale" VARCHAR(150),
    "infos_administratives" TEXT,
    "representant" VARCHAR(150),
    "telephone_principal" VARCHAR(20) NOT NULL,
    "telephone_secondaire" VARCHAR(20),
    "email" VARCHAR(150),
    "contact_urgence" VARCHAR(150),
    "statut" "StatutLocataire" NOT NULL DEFAULT 'actif',
    "date_archivage" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locataires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pieces_identite" (
    "id" UUID NOT NULL,
    "locataire_id" UUID NOT NULL,
    "type" "TypePieceIdentite" NOT NULL,
    "numero" VARCHAR(50) NOT NULL,
    "date_expiration" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pieces_identite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" UUID NOT NULL,
    "nom" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "mot_de_passe_hash" VARCHAR(255) NOT NULL,
    "profil" "ProfilUtilisateur" NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrats" (
    "id" UUID NOT NULL,
    "numero" VARCHAR(30) NOT NULL,
    "bien_id" UUID NOT NULL,
    "locataire_id" UUID NOT NULL,
    "date_debut" DATE NOT NULL,
    "date_fin" DATE NOT NULL,
    "montant_loyer" DECIMAL(12,0) NOT NULL,
    "charges" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "montant_caution" DECIMAL(12,0) NOT NULL,
    "avance_loyer" DECIMAL(12,0) DEFAULT 0,
    "periodicite" "Periodicite" NOT NULL,
    "statut" "StatutContrat" NOT NULL DEFAULT 'brouillon',
    "valide_par" UUID,
    "date_validation" TIMESTAMP(3),
    "contrat_parent_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contrats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revisions_loyer" (
    "id" UUID NOT NULL,
    "contrat_id" UUID NOT NULL,
    "ancien_montant" DECIMAL(12,0) NOT NULL,
    "nouveau_montant" DECIMAL(12,0) NOT NULL,
    "date_modification" DATE NOT NULL,
    "motif" TEXT NOT NULL,
    "demande_par" UUID NOT NULL,
    "valide_par" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revisions_loyer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cautions" (
    "id" UUID NOT NULL,
    "contrat_id" UUID NOT NULL,
    "montant_initial" DECIMAL(12,0) NOT NULL,
    "date_versement" DATE NOT NULL,
    "statut" "StatutCaution" NOT NULL DEFAULT 'detenue',
    "montant_retenu" DECIMAL(12,0) DEFAULT 0,
    "motif_retenue" TEXT,
    "montant_rembourse" DECIMAL(12,0),
    "date_remboursement" DATE,
    "valide_par" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cautions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factures" (
    "id" UUID NOT NULL,
    "numero" VARCHAR(30) NOT NULL,
    "contrat_id" UUID NOT NULL,
    "date_emission" DATE NOT NULL,
    "periode" VARCHAR(20) NOT NULL,
    "montant_loyer" DECIMAL(12,0) NOT NULL,
    "charges" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "arrieres" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "total_a_payer" DECIMAL(12,0) NOT NULL,
    "montant_paye" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "solde_restant" DECIMAL(12,0) NOT NULL,
    "statut" "StatutFacture" NOT NULL DEFAULT 'emise',
    "date_echeance" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "factures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements" (
    "id" UUID NOT NULL,
    "reference" VARCHAR(30) NOT NULL,
    "facture_id" UUID NOT NULL,
    "date_paiement" DATE NOT NULL,
    "montant" DECIMAL(12,0) NOT NULL,
    "mode" "ModePaiement" NOT NULL,
    "encaisse_par" UUID NOT NULL,
    "statut" "StatutPaiement" NOT NULL DEFAULT 'valide',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paiements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quittances" (
    "id" UUID NOT NULL,
    "numero" VARCHAR(30) NOT NULL,
    "paiement_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "lien_pdf" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quittances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "type_document" VARCHAR(50) NOT NULL,
    "reference" VARCHAR(150) NOT NULL,
    "lien_securise" VARCHAR(500) NOT NULL,
    "entite_type" "EntiteDocument" NOT NULL,
    "entite_id" UUID NOT NULL,
    "date_ajout" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ajoute_par" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "type" "TypeNotification" NOT NULL,
    "titre" VARCHAR(150) NOT NULL,
    "message" TEXT NOT NULL,
    "canal" "CanalNotification",
    "lue" BOOLEAN NOT NULL DEFAULT false,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audits" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "date_heure" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" VARCHAR(100) NOT NULL,
    "entite_type" VARCHAR(30) NOT NULL,
    "entite_id" UUID NOT NULL,
    "ancienne_valeur" JSONB,
    "nouvelle_valeur" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "communes_nom_key" ON "communes"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "quartiers_commune_id_nom_key" ON "quartiers"("commune_id", "nom");

-- CreateIndex
CREATE UNIQUE INDEX "biens_code_key" ON "biens"("code");

-- CreateIndex
CREATE UNIQUE INDEX "locataires_code_key" ON "locataires"("code");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "contrats_numero_key" ON "contrats"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "cautions_contrat_id_key" ON "cautions"("contrat_id");

-- CreateIndex
CREATE UNIQUE INDEX "factures_numero_key" ON "factures"("numero");

-- CreateIndex
CREATE INDEX "factures_contrat_id_statut_idx" ON "factures"("contrat_id", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "paiements_reference_key" ON "paiements"("reference");

-- CreateIndex
CREATE INDEX "paiements_facture_id_idx" ON "paiements"("facture_id");

-- CreateIndex
CREATE UNIQUE INDEX "quittances_numero_key" ON "quittances"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "quittances_paiement_id_key" ON "quittances"("paiement_id");

-- CreateIndex
CREATE INDEX "documents_entite_type_entite_id_idx" ON "documents"("entite_type", "entite_id");

-- CreateIndex
CREATE INDEX "audits_entite_type_entite_id_idx" ON "audits"("entite_type", "entite_id");

-- CreateIndex
CREATE INDEX "audits_date_heure_idx" ON "audits"("date_heure");

-- AddForeignKey
ALTER TABLE "quartiers" ADD CONSTRAINT "quartiers_commune_id_fkey" FOREIGN KEY ("commune_id") REFERENCES "communes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biens" ADD CONSTRAINT "biens_quartier_id_fkey" FOREIGN KEY ("quartier_id") REFERENCES "quartiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pieces_identite" ADD CONSTRAINT "pieces_identite_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "locataires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_bien_id_fkey" FOREIGN KEY ("bien_id") REFERENCES "biens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_locataire_id_fkey" FOREIGN KEY ("locataire_id") REFERENCES "locataires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_valide_par_fkey" FOREIGN KEY ("valide_par") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_contrat_parent_id_fkey" FOREIGN KEY ("contrat_parent_id") REFERENCES "contrats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revisions_loyer" ADD CONSTRAINT "revisions_loyer_contrat_id_fkey" FOREIGN KEY ("contrat_id") REFERENCES "contrats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revisions_loyer" ADD CONSTRAINT "revisions_loyer_demande_par_fkey" FOREIGN KEY ("demande_par") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revisions_loyer" ADD CONSTRAINT "revisions_loyer_valide_par_fkey" FOREIGN KEY ("valide_par") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cautions" ADD CONSTRAINT "cautions_contrat_id_fkey" FOREIGN KEY ("contrat_id") REFERENCES "contrats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cautions" ADD CONSTRAINT "cautions_valide_par_fkey" FOREIGN KEY ("valide_par") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures" ADD CONSTRAINT "factures_contrat_id_fkey" FOREIGN KEY ("contrat_id") REFERENCES "contrats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_facture_id_fkey" FOREIGN KEY ("facture_id") REFERENCES "factures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_encaisse_par_fkey" FOREIGN KEY ("encaisse_par") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quittances" ADD CONSTRAINT "quittances_paiement_id_fkey" FOREIGN KEY ("paiement_id") REFERENCES "paiements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_ajoute_par_fkey" FOREIGN KEY ("ajoute_par") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audits" ADD CONSTRAINT "audits_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
