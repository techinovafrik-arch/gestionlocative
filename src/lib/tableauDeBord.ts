import { prisma } from "@/lib/prisma";

// CDC §16.2 : indicateurs immobiliers.
export async function obtenirIndicateursImmobiliers() {
  const [total, occupes, libres, travaux] = await Promise.all([
    prisma.bien.count(),
    prisma.bien.count({ where: { statut: "occupe" } }),
    prisma.bien.count({ where: { statut: "libre" } }),
    prisma.bien.count({ where: { statut: "en_travaux" } }),
  ]);
  const tauxOccupation = total > 0 ? Math.round((occupes / total) * 100) : 0;

  return { total, occupes, libres, travaux, tauxOccupation };
}

async function caSurPeriode(debut: Date, fin: Date): Promise<number> {
  const paiements = await prisma.paiement.findMany({
    where: { datePaiement: { gte: debut, lt: fin }, statut: { not: "annule" } },
    select: { montant: true },
  });
  return paiements.reduce((total, paiement) => total + Number(paiement.montant), 0);
}

// CDC §16.2 : indicateurs financiers.
export async function obtenirIndicateursFinanciers(maintenant = new Date()) {
  const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
  const finMois = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 1);
  const debutTrimestre = new Date(maintenant.getFullYear(), Math.floor(maintenant.getMonth() / 3) * 3, 1);
  const finTrimestre = new Date(debutTrimestre.getFullYear(), debutTrimestre.getMonth() + 3, 1);
  const debutAnnee = new Date(maintenant.getFullYear(), 0, 1);
  const finAnnee = new Date(maintenant.getFullYear() + 1, 0, 1);

  const [facturesDuMois, facturesImpayees, facturesPartielles, caMensuel, caTrimestriel, caAnnuel] =
    await Promise.all([
      prisma.facture.findMany({
        where: { dateEmission: { gte: debutMois, lt: finMois } },
        select: { totalAPayer: true, montantPaye: true },
      }),
      prisma.facture.count({ where: { statut: "impayee" } }),
      prisma.facture.count({ where: { statut: "partiellement_payee" } }),
      caSurPeriode(debutMois, finMois),
      caSurPeriode(debutTrimestre, finTrimestre),
      caSurPeriode(debutAnnee, finAnnee),
    ]);

  const loyersAttendus = facturesDuMois.reduce((total, f) => total + Number(f.totalAPayer), 0);
  const loyersEncaisses = facturesDuMois.reduce((total, f) => total + Number(f.montantPaye), 0);

  return {
    loyersAttendus,
    loyersEncaisses,
    facturesImpayees,
    facturesPartielles,
    caMensuel,
    caTrimestriel,
    caAnnuel,
  };
}

// CDC §16.2 : indicateurs locatifs.
export async function obtenirIndicateursLocatifs(maintenant = new Date()) {
  const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
  const finMois = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 1);
  const dans30Jours = new Date(maintenant);
  dans30Jours.setDate(dans30Jours.getDate() + 30);

  const [locatairesActifs, nouveauxContrats, contratsAEcheance, departsRecents] = await Promise.all([
    prisma.locataire.count({ where: { statut: "actif" } }),
    prisma.contrat.count({ where: { createdAt: { gte: debutMois, lt: finMois } } }),
    prisma.contrat.count({ where: { statut: "actif", dateFin: { gte: maintenant, lte: dans30Jours } } }),
    prisma.locataire.count({ where: { statut: "archive", dateArchivage: { gte: debutMois, lt: finMois } } }),
  ]);

  return { locatairesActifs, nouveauxContrats, contratsAEcheance, departsRecents };
}

function formaterMois(date: Date): string {
  return date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
}

// CDC §16.9 : évolution du chiffre d'affaires (encaissements).
export async function obtenirEvolutionCA(maintenant = new Date(), nombreMois = 12) {
  const indices = Array.from({ length: nombreMois }, (_, i) => nombreMois - 1 - i);

  return Promise.all(
    indices.map(async (i) => {
      const debut = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
      const fin = new Date(maintenant.getFullYear(), maintenant.getMonth() - i + 1, 1);
      const montant = await caSurPeriode(debut, fin);
      return { mois: formaterMois(debut), montant };
    }),
  );
}

// CDC §16.9 : répartition des biens par catégorie (Appartement, Villa,
// Maison, Bureau, Magasin, Autres — regroupement du CDC, hors granularité
// technique des 11 types de biens de section 09/RG-B02).
export async function obtenirRepartitionBiens() {
  const groupes = await prisma.bien.groupBy({ by: ["type"], _count: { type: true } });

  const libelles: Record<string, string> = {
    appartement: "Appartement",
    villa: "Villa",
    maison: "Maison",
    bureau: "Bureau",
    magasin: "Magasin",
  };

  const buckets = new Map<string, number>([
    ["Appartement", 0],
    ["Villa", 0],
    ["Maison", 0],
    ["Bureau", 0],
    ["Magasin", 0],
    ["Autres", 0],
  ]);

  for (const groupe of groupes) {
    const cle = libelles[groupe.type] ?? "Autres";
    buckets.set(cle, (buckets.get(cle) ?? 0) + groupe._count.type);
  }

  return Array.from(buckets.entries())
    .map(([categorie, total]) => ({ categorie, total }))
    .filter((point) => point.total > 0);
}

// CDC §16.9 : évolution des impayés (nombre de clients concernés, montant
// total, par mois d'échéance).
export async function obtenirEvolutionImpayes(maintenant = new Date(), nombreMois = 6) {
  const indices = Array.from({ length: nombreMois }, (_, i) => nombreMois - 1 - i);

  return Promise.all(
    indices.map(async (i) => {
      const debut = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
      const fin = new Date(maintenant.getFullYear(), maintenant.getMonth() - i + 1, 1);

      const facturesImpayees = await prisma.facture.findMany({
        where: { statut: "impayee", dateEcheance: { gte: debut, lt: fin } },
        select: { soldeRestant: true, contrat: { select: { locataireId: true } } },
      });

      const montant = facturesImpayees.reduce((total, f) => total + Number(f.soldeRestant), 0);
      const clients = new Set(facturesImpayees.map((f) => f.contrat.locataireId)).size;

      return { mois: formaterMois(debut), montant, clients };
    }),
  );
}
