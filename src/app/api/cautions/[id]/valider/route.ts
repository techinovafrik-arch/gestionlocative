import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, requirePermission } from "@/lib/api";
import { enregistrerAudit } from "@/lib/audit";
import { cautionDecisionSchema } from "@/lib/validations/contrat";

type Contexte = { params: Promise<{ id: string }> };

// POST /api/cautions/[id]/valider — Gérant uniquement (RG-K02, RG-K03, RG-U02).
export async function POST(request: NextRequest, { params }: Contexte) {
  try {
    const session = await requirePermission("cautions.validation", "valider");
    const { id } = await params;
    const donnees = cautionDecisionSchema.parse(await request.json());

    const cautionAvant = await prisma.caution.findUnique({ where: { id } });
    if (!cautionAvant) throw new ApiError(404, "Caution introuvable.");
    if (cautionAvant.statut !== "detenue") {
      throw new ApiError(409, "Cette caution a déjà été soldée.");
    }

    const montantInitial = Number(cautionAvant.montantInitial);
    const montantRetenu = donnees.decision === "retenue" ? (donnees.montantRetenu ?? 0) : 0;
    const montantRembourse = montantInitial - montantRetenu;

    if (montantRetenu > montantInitial) {
      throw new ApiError(400, "Le montant retenu ne peut pas dépasser le montant initial de la caution.");
    }

    const caution = await prisma.caution.update({
      where: { id },
      data: {
        statut: donnees.decision === "retenue" ? "remboursee_avec_retenue" : "remboursee",
        montantRetenu,
        motifRetenue: donnees.decision === "retenue" ? donnees.motifRetenue : null,
        montantRembourse,
        dateRemboursement: new Date(),
        valideParId: session.user.id,
      },
    });

    await enregistrerAudit({
      utilisateurId: session.user.id,
      action: "validation_caution",
      entiteType: "caution",
      entiteId: id,
      ancienneValeur: { statut: cautionAvant.statut },
      nouvelleValeur: caution,
    });

    return NextResponse.json({ caution });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
