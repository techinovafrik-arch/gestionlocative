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
