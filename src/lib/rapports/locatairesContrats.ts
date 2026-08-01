import { prisma } from "@/lib/prisma";

// CDC §16.4 : Liste des locataires actifs.
export async function locatairesActifs() {
  return prisma.locataire.findMany({
    where: { statut: "actif" },
    include: { contrats: { where: { statut: "actif" }, include: { bien: true }, take: 1 } },
    orderBy: { code: "asc" },
  });
}

// CDC §16.4 : Historique d'un locataire (logements, contrats, paiements).
// Pas de suivi des « incidents » dans le modèle validé (section 10) — champ
// hors périmètre V1, non représenté ici.
export async function historiqueLocataire(locataireId: string) {
  const locataire = await prisma.locataire.findUnique({
    where: { id: locataireId },
    include: {
      contrats: {
        include: {
          bien: true,
          factures: { include: { paiements: true }, orderBy: { dateEmission: "desc" } },
        },
        orderBy: { dateDebut: "desc" },
      },
    },
  });
  return locataire;
}

// CDC §16.5 : Contrats arrivant à échéance (filtre 30/60/90 jours).
export async function contratsAEcheance(jours: 30 | 60 | 90, maintenant = new Date()) {
  const limite = new Date(maintenant);
  limite.setDate(limite.getDate() + jours);

  return prisma.contrat.findMany({
    where: { statut: "actif", dateFin: { gte: maintenant, lte: limite } },
    include: { bien: true, locataire: true },
    orderBy: { dateFin: "asc" },
  });
}
