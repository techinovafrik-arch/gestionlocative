import { prisma } from "@/lib/prisma";
import type { ModePaiement, StatutFacture } from "@/generated/prisma";
import { genererNumeroQuittance, genererReferencePaiement } from "@/lib/codes";

export class ErreurPaiement extends Error {
  code:
    | "AUCUNE_FACTURE_DUE"
    | "MONTANT_SUPERIEUR_AU_SOLDE"
    | "PAIEMENT_INTROUVABLE"
    | "MONTANT_INVALIDE";

  constructor(code: ErreurPaiement["code"], message: string) {
    super(message);
    this.code = code;
  }
}

function statutFacture(soldeRestant: number, montantPaye: number): StatutFacture {
  if (soldeRestant <= 0) return "payee";
  if (montantPaye > 0) return "partiellement_payee";
  return "emise";
}

// RG-P06 : la facture la plus ancienne due du locataire (échéance la plus
// proche en premier), tous contrats confondus.
async function trouverFactureLaPlusAncienneDue(locataireId: string) {
  return prisma.facture.findFirst({
    where: {
      statut: { in: ["emise", "partiellement_payee", "impayee"] },
      contrat: { locataireId },
    },
    orderBy: { dateEcheance: "asc" },
  });
}

// RG-P01, RG-P03, RG-P05, RG-P06 : enregistrement d'un paiement (total ou
// partiel), imputation automatique sur la facture la plus ancienne due,
// génération de la quittance dans la même transaction.
export async function enregistrerPaiement(params: {
  locataireId: string;
  montant: number;
  mode: ModePaiement;
  datePaiement: Date;
  encaisseParId: string;
}) {
  const facture = await trouverFactureLaPlusAncienneDue(params.locataireId);
  if (!facture) {
    throw new ErreurPaiement("AUCUNE_FACTURE_DUE", "Aucune facture due pour ce locataire.");
  }

  const soldeRestant = Number(facture.soldeRestant);
  if (params.montant > soldeRestant) {
    throw new ErreurPaiement(
      "MONTANT_SUPERIEUR_AU_SOLDE",
      `Le montant dépasse le solde restant dû sur la facture ${facture.numero} (${soldeRestant} FCFA).`,
    );
  }

  const reference = await genererReferencePaiement();
  const numeroQuittance = await genererNumeroQuittance();

  return prisma.$transaction(async (tx) => {
    const paiement = await tx.paiement.create({
      data: {
        reference,
        factureId: facture.id,
        datePaiement: params.datePaiement,
        montant: params.montant,
        mode: params.mode,
        encaisseParId: params.encaisseParId,
        statut: "valide",
      },
    });

    const nouveauMontantPaye = Number(facture.montantPaye) + params.montant;
    const nouveauSolde = Number(facture.totalAPayer) - nouveauMontantPaye;

    const factureMiseAJour = await tx.facture.update({
      where: { id: facture.id },
      data: {
        montantPaye: nouveauMontantPaye,
        soldeRestant: nouveauSolde,
        statut: statutFacture(nouveauSolde, nouveauMontantPaye),
      },
    });

    // RG-P05 : quittance générée automatiquement après validation du paiement.
    const quittance = await tx.quittance.create({
      data: { numero: numeroQuittance, paiementId: paiement.id, date: params.datePaiement },
    });

    return { paiement, facture: factureMiseAJour, quittance };
  });
}

// RG-P04 : correction d'un paiement (Gérant uniquement) — répercutée sur la
// facture associée.
export async function corrigerPaiement(params: {
  paiementId: string;
  nouveauMontant?: number;
  nouveauMode?: ModePaiement;
}) {
  const paiement = await prisma.paiement.findUnique({ where: { id: params.paiementId } });
  if (!paiement) {
    throw new ErreurPaiement("PAIEMENT_INTROUVABLE", "Paiement introuvable.");
  }

  const facture = await prisma.facture.findUnique({ where: { id: paiement.factureId } });
  if (!facture) {
    throw new ErreurPaiement("PAIEMENT_INTROUVABLE", "Facture associée introuvable.");
  }

  const nouveauMontant = params.nouveauMontant ?? Number(paiement.montant);
  const montantPayeSansCePaiement = Number(facture.montantPaye) - Number(paiement.montant);
  const nouveauMontantPayeFacture = montantPayeSansCePaiement + nouveauMontant;
  const nouveauSoldeFacture = Number(facture.totalAPayer) - nouveauMontantPayeFacture;

  if (nouveauMontantPayeFacture < 0 || nouveauMontantPayeFacture > Number(facture.totalAPayer)) {
    throw new ErreurPaiement(
      "MONTANT_INVALIDE",
      "Le nouveau montant est incohérent avec le total dû de la facture.",
    );
  }

  return prisma.$transaction(async (tx) => {
    const paiementCorrige = await tx.paiement.update({
      where: { id: paiement.id },
      data: {
        montant: nouveauMontant,
        mode: params.nouveauMode ?? paiement.mode,
        statut: "corrige",
      },
    });

    const factureMiseAJour = await tx.facture.update({
      where: { id: facture.id },
      data: {
        montantPaye: nouveauMontantPayeFacture,
        soldeRestant: nouveauSoldeFacture,
        statut: statutFacture(nouveauSoldeFacture, nouveauMontantPayeFacture),
      },
    });

    return { paiement: paiementCorrige, facture: factureMiseAJour };
  });
}
