import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";

// D-045 : zone « Factures impayées » de l'écran /factures — hors CDC initial,
// ajoutée sur demande du client. « Impayée » y désigne toute facture non
// soldée (Émise + Partiellement payée + Impayée), pas seulement le statut
// « Impayée » au sens strict (RG-N04) utilisé ailleurs dans l'application.
const STATUTS_NON_SOLDES = ["emise", "partiellement_payee", "impayee"] as const;

export const PERIODES_FILTRE = ["jour", "mois", "annee", "total"] as const;
export type PeriodeFiltre = (typeof PERIODES_FILTRE)[number];

export const TAILLE_PAGE_FACTURES_IMPAYEES = 10;

// Filtre sur la date d'échéance (cohérent avec le suivi des impayés déjà en
// place — balance des impayés, tableau de bord). "jour" = échéance du jour ;
// "mois" = échéance dans les 30 derniers jours (glissant) ; "année" = échéance
// dans l'année civile en cours ; "total" = aucun filtre de date.
function plageDates(periode: PeriodeFiltre, maintenant: Date): Prisma.DateTimeFilter | undefined {
  const debutJour = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
  const finJour = new Date(debutJour);
  finJour.setDate(finJour.getDate() + 1);

  switch (periode) {
    case "jour":
      return { gte: debutJour, lt: finJour };
    case "mois": {
      const ilYA30Jours = new Date(debutJour);
      ilYA30Jours.setDate(ilYA30Jours.getDate() - 30);
      return { gte: ilYA30Jours, lt: finJour };
    }
    case "annee": {
      const debutAnnee = new Date(maintenant.getFullYear(), 0, 1);
      const finAnnee = new Date(maintenant.getFullYear() + 1, 0, 1);
      return { gte: debutAnnee, lt: finAnnee };
    }
    case "total":
      return undefined;
  }
}

export async function listerFacturesNonSoldees(params: {
  periode: PeriodeFiltre;
  page: number; // 1-based
  maintenant?: Date;
}) {
  const maintenant = params.maintenant ?? new Date();
  const page = Math.max(1, params.page);
  const where: Prisma.FactureWhereInput = {
    statut: { in: [...STATUTS_NON_SOLDES] },
    dateEcheance: plageDates(params.periode, maintenant),
  };

  const [total, totalMontantDu, factures] = await Promise.all([
    prisma.facture.count({ where }),
    prisma.facture.aggregate({ where, _sum: { soldeRestant: true } }),
    prisma.facture.findMany({
      where,
      include: { contrat: { include: { locataire: true } } },
      orderBy: { dateEcheance: "asc" },
      skip: (page - 1) * TAILLE_PAGE_FACTURES_IMPAYEES,
      take: TAILLE_PAGE_FACTURES_IMPAYEES,
    }),
  ]);

  return {
    factures,
    total,
    totalMontantDu: Number(totalMontantDu._sum.soldeRestant ?? 0),
    nombrePages: Math.max(1, Math.ceil(total / TAILLE_PAGE_FACTURES_IMPAYEES)),
    page,
  };
}
