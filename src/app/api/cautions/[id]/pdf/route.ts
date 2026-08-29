import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, requirePermission } from "@/lib/api";
import { genererRecuCautionPdf } from "@/lib/pdf/caution";

type Contexte = { params: Promise<{ id: string }> };

// GET /api/cautions/[id]/pdf — reçu de versement à la signature (RG-K01,
// RG-K04). Lecture ouverte à tous les profils, comme le suivi des cautions
// (§14.1 « Cautions — suivre »).
export async function GET(_request: NextRequest, { params }: Contexte) {
  try {
    await requirePermission("cautions", "lire");
    const { id } = await params;

    const caution = await prisma.caution.findUnique({
      where: { id },
      include: { contrat: { include: { bien: true, locataire: true } } },
    });
    if (!caution) throw new ApiError(404, "Caution introuvable.");

    const buffer = await genererRecuCautionPdf(caution);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="recu-caution-${caution.contrat.numero}.pdf"`,
      },
    });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
