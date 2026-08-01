import { prisma } from "@/lib/prisma";
import type { StatutBien, TypeBien } from "@/generated/prisma";

// CDC §16.3 : Liste des biens (filtrable type/quartier/disponibilité).
export async function listeBiens(filtres: { type?: TypeBien; quartierId?: string; statut?: StatutBien }) {
  return prisma.bien.findMany({
    where: {
      type: filtres.type,
      quartierId: filtres.quartierId,
      statut: filtres.statut,
    },
    include: { quartier: { include: { commune: true } } },
    orderBy: { code: "asc" },
  });
}

// CDC §16.3 : Biens disponibles. Pas de champ dédié « date de mise en
// disponibilité » dans le modèle validé (section 10) — approximé par
// `updated_at` (dernier changement de statut), à affiner si le besoin de
// précision se confirme.
export async function biensDisponibles() {
  const biens = await prisma.bien.findMany({
    where: { statut: "libre" },
    include: { quartier: { include: { commune: true } } },
    orderBy: { updatedAt: "asc" },
  });

  const maintenant = Date.now();
  return biens.map((bien) => ({
    ...bien,
    dureeVacanceJours: Math.floor((maintenant - bien.updatedAt.getTime()) / (1000 * 60 * 60 * 24)),
  }));
}

// CDC §16.3 : Biens occupés (avec le contrat actif associé).
export async function biensOccupes() {
  const biens = await prisma.bien.findMany({
    where: { statut: "occupe" },
    include: {
      quartier: { include: { commune: true } },
      contrats: { where: { statut: "actif" }, include: { locataire: true }, take: 1 },
    },
    orderBy: { code: "asc" },
  });

  return biens.map((bien) => ({ ...bien, contratActif: bien.contrats[0] ?? null }));
}

// CDC §16.3 : Historique des occupations d'un bien.
export async function historiqueOccupations(bienId: string) {
  return prisma.contrat.findMany({
    where: { bienId },
    include: { locataire: true },
    orderBy: { dateDebut: "desc" },
  });
}
