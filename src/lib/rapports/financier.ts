import { prisma } from "@/lib/prisma";

const INCLUSION_FACTURE = { contrat: { include: { bien: true, locataire: true } } } as const;

// CDC §16.6 : Factures émises (toutes, indépendamment du statut).
export async function facturesEmises() {
  return prisma.facture.findMany({ include: INCLUSION_FACTURE, orderBy: { dateEmission: "desc" } });
}

// CDC §16.6 : Factures impayées, avec jours de retard.
export async function facturesImpayees(maintenant = new Date()) {
  const factures = await prisma.facture.findMany({
    where: { statut: "impayee" },
    include: INCLUSION_FACTURE,
    orderBy: { dateEcheance: "asc" },
  });

  return factures.map((facture) => ({
    ...facture,
    joursRetard: Math.max(
      0,
      Math.floor((maintenant.getTime() - facture.dateEcheance.getTime()) / (1000 * 60 * 60 * 24)),
    ),
  }));
}

// CDC §16.6 : Factures partiellement payées.
export async function facturesPartiellementPayees() {
  return prisma.facture.findMany({
    where: { statut: "partiellement_payee" },
    include: INCLUSION_FACTURE,
    orderBy: { dateEcheance: "asc" },
  });
}

// CDC §16.6 : Journal des encaissements.
export async function journalEncaissements() {
  return prisma.paiement.findMany({
    include: {
      facture: { include: { contrat: { include: { bien: true, locataire: true } } } },
      encaissePar: { select: { nom: true } },
    },
    orderBy: { datePaiement: "desc" },
  });
}

// CDC §16.6 : Relevé des paiements d'un locataire.
export async function relevePaiementsLocataire(locataireId: string) {
  return prisma.paiement.findMany({
    where: { facture: { contrat: { locataireId } } },
    include: {
      facture: true,
      encaissePar: { select: { nom: true } },
    },
    orderBy: { datePaiement: "desc" },
  });
}
