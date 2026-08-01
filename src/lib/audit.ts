import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";

// RG-U03, dossier/14-securite-profils.md §14.3 : traçabilité des créations,
// modifications et suppressions/archivages sur les entités métier.
function versJson(valeur: unknown): Prisma.InputJsonValue | undefined {
  if (valeur === undefined || valeur === null) return undefined;
  return JSON.parse(JSON.stringify(valeur));
}

export async function enregistrerAudit(params: {
  utilisateurId: string;
  action: string;
  entiteType: string;
  entiteId: string;
  ancienneValeur?: unknown;
  nouvelleValeur?: unknown;
}) {
  await prisma.audit.create({
    data: {
      utilisateurId: params.utilisateurId,
      action: params.action,
      entiteType: params.entiteType,
      entiteId: params.entiteId,
      ancienneValeur: versJson(params.ancienneValeur),
      nouvelleValeur: versJson(params.nouvelleValeur),
    },
  });
}

const EMAIL_UTILISATEUR_SYSTEME = "systeme@cimec.local";

// Compte technique (jamais utilisable pour se connecter, actif=false) servant
// de porteur d'utilisateur_id pour les audits déclenchés par des acteurs
// systèmes (planificateur de facturation, renouvellement tacite — CDC §4.2).
export async function obtenirUtilisateurSysteme() {
  const existant = await prisma.utilisateur.findUnique({
    where: { email: EMAIL_UTILISATEUR_SYSTEME },
  });
  if (existant) return existant;

  return prisma.utilisateur.create({
    data: {
      nom: "Planificateur système",
      email: EMAIL_UTILISATEUR_SYSTEME,
      motDePasseHash: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12),
      profil: "administrateur",
      actif: false,
    },
  });
}
