import { prisma } from "@/lib/prisma";
import type { Contrat } from "@/generated/prisma";
import { genererNumeroFacture } from "@/lib/codes";
import { notifierStaff } from "@/lib/notifications/interne";

export class ErreurFacturation extends Error {
  code: "CONTRAT_INTROUVABLE" | "CONTRAT_NON_ACTIF" | "DEJA_GENEREE";
  constructor(code: ErreurFacturation["code"], message: string) {
    super(message);
    this.code = code;
  }
}

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
// dépassée, passe en statut "impayée". RG-N04 : le gestionnaire et le gérant
// en sont notifiés en interne (la relance externe au locataire est gérée par
// lib/relances.ts, sur un cycle distinct).
async function marquerFacturesEnRetard(maintenant: Date) {
  const facturesEnRetard = await prisma.facture.findMany({
    where: { statut: "emise", montantPaye: 0, dateEcheance: { lt: maintenant } },
    select: { id: true, numero: true },
  });
  if (facturesEnRetard.length === 0) return;

  await prisma.facture.updateMany({
    where: { id: { in: facturesEnRetard.map((f) => f.id) } },
    data: { statut: "impayee" },
  });

  await notifierStaff({
    profils: ["gestionnaire", "gerant"],
    type: "alerte",
    titre: `${facturesEnRetard.length} facture(s) en retard de paiement`,
    message: `Factures concernées : ${facturesEnRetard.map((f) => f.numero).join(", ")}.`,
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

  // RG-N02, RG-N03 : notification interne du staff après génération.
  if (facturesGenerees.length > 0) {
    await notifierStaff({
      profils: ["administrateur", "gerant", "gestionnaire"],
      type: "information",
      titre: `${facturesGenerees.length} facture(s) générée(s)`,
      message: `Factures : ${facturesGenerees.map((f) => f.numero).join(", ")}.`,
    });
  }

  return facturesGenerees;
}

// D-042 : génération manuelle ciblée sur un seul contrat (Administrateur,
// Gestionnaire locatif), hors cycle du 25 — ex. contrat oublié par le cycle
// automatique, ou nouveau contrat à facturer immédiatement. Réutilise
// exactement les mêmes règles que le cycle automatique (RG-F01, RG-F05,
// RG-F06, RG-F08) : aucune saisie libre de montant ou de période.
export async function genererFacturePourContrat(contratId: string, maintenant = new Date()) {
  const contrat = await prisma.contrat.findUnique({ where: { id: contratId } });
  if (!contrat) {
    throw new ErreurFacturation("CONTRAT_INTROUVABLE", "Contrat introuvable.");
  }
  if (contrat.statut !== "actif") {
    throw new ErreurFacturation(
      "CONTRAT_NON_ACTIF",
      "Seul un contrat actif peut être facturé.",
    );
  }

  const facture =
    contrat.periodicite === "mensuelle"
      ? await genererFactureMensuelle(contrat, maintenant)
      : await genererFactureGlobale(contrat, maintenant);

  if (!facture) {
    throw new ErreurFacturation(
      "DEJA_GENEREE",
      "Une facture existe déjà pour la période en cours de ce contrat.",
    );
  }

  await notifierStaff({
    profils: ["administrateur", "gerant", "gestionnaire"],
    type: "information",
    titre: `Facture ${facture.numero} générée manuellement`,
    message: `Facture ${facture.numero} générée pour le contrat ${contrat.numero}.`,
  });

  return facture;
}
