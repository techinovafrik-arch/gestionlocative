import { prisma } from "@/lib/prisma";

async function totalAttenduSurPeriode(debut: Date, fin: Date): Promise<number> {
  const factures = await prisma.facture.findMany({
    where: { dateEmission: { gte: debut, lt: fin } },
    select: { totalAPayer: true },
  });
  return factures.reduce((total, f) => total + Number(f.totalAPayer), 0);
}

async function totalEncaisseSurPeriode(debut: Date, fin: Date): Promise<number> {
  const paiements = await prisma.paiement.findMany({
    where: { datePaiement: { gte: debut, lt: fin }, statut: { not: "annule" } },
    select: { montant: true },
  });
  return paiements.reduce((total, p) => total + Number(p.montant), 0);
}

// CDC §16.8 : loyers attendus / loyers encaissés — prévision, réalisation,
// écart, par période (mois, trimestre, année).
export async function syntheseLoyers(maintenant = new Date()) {
  const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
  const finMois = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 1);
  const debutTrimestre = new Date(maintenant.getFullYear(), Math.floor(maintenant.getMonth() / 3) * 3, 1);
  const finTrimestre = new Date(debutTrimestre.getFullYear(), debutTrimestre.getMonth() + 3, 1);
  const debutAnnee = new Date(maintenant.getFullYear(), 0, 1);
  const finAnnee = new Date(maintenant.getFullYear() + 1, 0, 1);

  const periodes = [
    { periode: "Mois courant", debut: debutMois, fin: finMois },
    { periode: "Trimestre courant", debut: debutTrimestre, fin: finTrimestre },
    { periode: "Année courante", debut: debutAnnee, fin: finAnnee },
  ];

  return Promise.all(
    periodes.map(async (p) => {
      const [prevision, realisation] = await Promise.all([
        totalAttenduSurPeriode(p.debut, p.fin),
        totalEncaisseSurPeriode(p.debut, p.fin),
      ]);
      return { periode: p.periode, prevision, realisation, ecart: realisation - prevision };
    }),
  );
}

// CDC §16.8 : balance des impayés (montant dû cumulé par locataire).
export async function balanceImpayes(maintenant = new Date()) {
  const factures = await prisma.facture.findMany({
    where: { statut: "impayee" },
    include: { contrat: { include: { locataire: true } } },
  });

  const balances = new Map<
    string,
    { locataire: (typeof factures)[number]["contrat"]["locataire"]; montantDu: number; joursRetard: number }
  >();

  for (const facture of factures) {
    const { locataire } = facture.contrat;
    const jours = Math.max(
      0,
      Math.floor((maintenant.getTime() - facture.dateEcheance.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const entree = balances.get(locataire.id) ?? { locataire, montantDu: 0, joursRetard: 0 };
    entree.montantDu += Number(facture.soldeRestant);
    entree.joursRetard = Math.max(entree.joursRetard, jours);
    balances.set(locataire.id, entree);
  }

  return Array.from(balances.values()).sort((a, b) => b.montantDu - a.montantDu);
}
