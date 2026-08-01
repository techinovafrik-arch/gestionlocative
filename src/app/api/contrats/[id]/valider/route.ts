import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, requirePermission } from "@/lib/api";
import { enregistrerAudit } from "@/lib/audit";

type Contexte = { params: Promise<{ id: string }> };

const INCLUSION = { bien: true, locataire: true, caution: true } as const;

// POST /api/contrats/[id]/valider — Gérant uniquement (RG-C05, RG-U02, UC-03).
// Active le contrat et passe le bien à « Occupé ».
export async function POST(_request: NextRequest, { params }: Contexte) {
  try {
    const session = await requirePermission("contrats.validation", "valider");
    const { id } = await params;

    const contratAvant = await prisma.contrat.findUnique({
      where: { id },
      include: { bien: true },
    });
    if (!contratAvant) throw new ApiError(404, "Contrat introuvable.");
    if (contratAvant.statut !== "brouillon") {
      throw new ApiError(409, "Ce contrat n'est pas en attente de validation.");
    }
    if (contratAvant.bien.statut !== "libre") {
      throw new ApiError(409, "Le bien associé n'est plus disponible.");
    }

    const [, contrat] = await prisma.$transaction([
      prisma.bien.update({
        where: { id: contratAvant.bienId },
        data: { statut: "occupe" },
      }),
      prisma.contrat.update({
        where: { id },
        data: {
          statut: "actif",
          valideParId: session.user.id,
          dateValidation: new Date(),
        },
        include: INCLUSION,
      }),
    ]);

    await enregistrerAudit({
      utilisateurId: session.user.id,
      action: "validation_contrat",
      entiteType: "contrat",
      entiteId: id,
      ancienneValeur: { statut: contratAvant.statut },
      nouvelleValeur: { statut: contrat.statut },
    });

    return NextResponse.json({ contrat });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
