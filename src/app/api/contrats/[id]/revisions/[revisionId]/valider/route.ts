import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, requirePermission } from "@/lib/api";
import { enregistrerAudit } from "@/lib/audit";

type Contexte = { params: Promise<{ id: string; revisionId: string }> };

// POST /api/contrats/[id]/revisions/[revisionId]/valider — Gérant uniquement
// (RG-C07, RG-U02). Applique le nouveau loyer au contrat.
export async function POST(_request: NextRequest, { params }: Contexte) {
  try {
    const session = await requirePermission("revisionsLoyer.validation", "valider");
    const { id, revisionId } = await params;

    const revision = await prisma.revisionLoyer.findUnique({ where: { id: revisionId } });
    if (!revision || revision.contratId !== id) {
      throw new ApiError(404, "Révision introuvable.");
    }
    if (revision.valideParId) {
      throw new ApiError(409, "Cette révision a déjà été validée.");
    }

    const [revisionValidee, contrat] = await prisma.$transaction([
      prisma.revisionLoyer.update({
        where: { id: revisionId },
        data: { valideParId: session.user.id },
      }),
      prisma.contrat.update({
        where: { id },
        data: { montantLoyer: revision.nouveauMontant },
      }),
    ]);

    await enregistrerAudit({
      utilisateurId: session.user.id,
      action: "validation_revision_loyer",
      entiteType: "revision_loyer",
      entiteId: revisionId,
      ancienneValeur: { montantLoyer: revision.ancienMontant },
      nouvelleValeur: { montantLoyer: contrat.montantLoyer },
    });

    return NextResponse.json({ revision: revisionValidee, contrat });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
