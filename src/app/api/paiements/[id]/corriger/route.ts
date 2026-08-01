import { NextRequest, NextResponse } from "next/server";
import { handleApiError, requirePermission } from "@/lib/api";
import { enregistrerAudit } from "@/lib/audit";
import { corrigerPaiement } from "@/lib/paiements";
import { paiementCorrectionSchema } from "@/lib/validations/paiement";

type Contexte = { params: Promise<{ id: string }> };

// POST /api/paiements/[id]/corriger — Gérant uniquement (RG-P04, RG-U02).
export async function POST(request: NextRequest, { params }: Contexte) {
  try {
    const session = await requirePermission("paiements.correction", "valider");
    const { id } = await params;
    const donnees = paiementCorrectionSchema.parse(await request.json());

    const resultat = await corrigerPaiement({
      paiementId: id,
      nouveauMontant: donnees.nouveauMontant,
      nouveauMode: donnees.nouveauMode,
    });

    await enregistrerAudit({
      utilisateurId: session.user.id,
      action: "correction_paiement",
      entiteType: "paiement",
      entiteId: id,
      ancienneValeur: { motif: donnees.motif },
      nouvelleValeur: resultat,
    });

    return NextResponse.json(resultat);
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
