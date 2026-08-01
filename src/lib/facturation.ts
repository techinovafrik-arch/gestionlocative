import { prisma } from "@/lib/prisma";
import type { Contrat } from "@/generated/prisma";
import { genererNumeroFacture } from "@/lib/codes";

// RG-F05 : échéance avant le 10 du mois facturé.
const JOUR_ECHEANCE = 10;

// Fenêtre d'anticipation pour les factures globales (trimestrielle/annuelle) :
// même logique d'avance que le cycle mensuel (RG-F01, généré ~1 mois avant).
const JOURS_ANTICIPATION_GLOBALE = 35;

function ajouterMois(date: Date, mois: number): Date {
  const resultat = new Date(date);
  resultat.setMonth(resultat.getMonth() + mois);
  return resultat;
}

function formaterPeriodeMensuelle(date: Date): string {
  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  return `${annee}-${mois}`;
}

// Pas d'alignement calendaire pour les périodes trimestrielles/annuelles :
// elles suivent l'anniversaire du contrat (dateDebut), pas le calendrier
// civil, faute de précision contraire dans le dossier de conception (D-021).
function formaterPeriodeGlobale(debut: Date, fin: Date): string {
  const f = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `${f(debut)}-${f(fin)}`;
}

// RG-F02 (« Arriérés : retards éventuels ») : somme des soldes restants des
// factures non intégralement payées du contrat.
async function calculerArrieres(contratId: string): Promise<number> {
  const facturesImpayees = await prisma.facture.findMany({
    where: { contratId, statut: { not: "payee" } },
    select: { soldeRestant: true },
  });
  return facturesImpayees.reduce((total, f) => total + Number(f.soldeRestant), 0);
}

// P4 (section 08) : une facture émise, non réglée, dont l'échéance est
// dépassée, passe en statut "impayée" (base des futures alertes — Sprint 6).
async function marquerFacturesEnRetard(maintenant: Date) {
  await prisma.facture.updateMany({
    where: { statut: "emise", montantPaye: 0, dateEcheance: { lt: maintenant } },
    data: { statut: "impayee" },
  });
}

async function genererFactureMensuelle(contrat: Contrat, maintenant: Date) {
  const moisFacture = ajouterMois(maintenant, 1);
  const periode = formaterPeriodeMensuelle(moisFacture);

  const dejaGeneree = await prisma.facture.findFirst({ where: { contratId: contrat.id, periode } });
  if (dejaGeneree) return null;

  const arrieres = await calculerArrieres(contrat.id);
  const montantLoyer = Number(contrat.montantLoyer);
  const charges = Number(contrat.charges);
  const totalAPayer = montantLoyer + charges + arrieres;

  return prisma.facture.create({
    data: {
      numero: await genererNumeroFacture(),
      contratId: contrat.id,
      dateEmission: maintenant,
      periode,
      montantLoyer,
      charges,
      arrieres,
      totalAPayer,
      montantPaye: 0,
      soldeRestant: totalAPayer,
      statut: "emise",
      // RG-F05 : échéance le 10 du mois facturé (mois plein, sans prorata — RG-F06).
      dateEcheance: new Date(moisFacture.getFullYear(), moisFacture.getMonth(), JOUR_ECHEANCE),
    },
  });
}

// RG-F08, D-021 : facture globale unique pour les contrats trimestriels/annuels.
async function genererFactureGlobale(contrat: Contrat, maintenant: Date) {
  const moisParPeriode = contrat.periodicite === "trimestrielle" ? 3 : 12;
  const facturesExistantes = await prisma.facture.count({ where: { contratId: contrat.id } });

  const debutPeriode = ajouterMois(contrat.dateDebut, facturesExistantes * moisParPeriode);
  const finPeriode = ajouterMois(contrat.dateDebut, (facturesExistantes + 1) * moisParPeriode);

  const finFenetreAnticipation = new Date(maintenant);
  finFenetreAnticipation.setDate(finFenetreAnticipation.getDate() + JOURS_ANTICIPATION_GLOBALE);
  if (debutPeriode > finFenetreAnticipation) return null;

  const periode = formaterPeriodeGlobale(debutPeriode, finPeriode);
  const dejaGeneree = await prisma.facture.findFirst({ where: { contratId: contrat.id, periode } });
  if (dejaGeneree) return null;

  const arrieres = await calculerArrieres(contrat.id);
  const montantLoyer = Number(contrat.montantLoyer) * moisParPeriode;
  const charges = Number(contrat.charges) * moisParPeriode;
  const totalAPayer = montantLoyer + charges + arrieres;

  return prisma.facture.create({
    data: {
      numero: await genererNumeroFacture(),
      contratId: contrat.id,
      dateEmission: maintenant,
      periode,
      montantLoyer,
      charges,
      arrieres,
      totalAPayer,
      montantPaye: 0,
      soldeRestant: totalAPayer,
      statut: "emise",
      // Payée d'avance (D-021) : échéance au début de la période couverte.
      dateEcheance: debutPeriode,
    },
  });
}

// RG-N03 : le cycle complet (recherche des contrats actifs → calcul →
// génération). Le déclenchement (« le 25 de chaque mois », RG-F01) est une
// responsabilité opérationnelle du planificateur externe, pas de cette
// fonction (idempotente, rejouable à tout moment sans double génération).
export async function genererFacturesDuCycle(maintenant = new Date()) {
  await marquerFacturesEnRetard(maintenant);

  const contratsActifs = await prisma.contrat.findMany({ where: { statut: "actif" } });

  const facturesGenerees = [];
  for (const contrat of contratsActifs) {
    const facture =
      contrat.periodicite === "mensuelle"
        ? await genererFactureMensuelle(contrat, maintenant)
        : await genererFactureGlobale(contrat, maintenant);
    if (facture) facturesGenerees.push(facture);
  }

  return facturesGenerees;
}
