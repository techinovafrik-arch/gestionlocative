import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, requirePermission } from "@/lib/api";
import { genererQuittancePdf } from "@/lib/pdf/quittance";

type Contexte = { params: Promise<{ id: string }> };

// GET /api/quittances/[id]/pdf — RG-P05 (CDC §10).
export async function GET(_request: NextRequest, { params }: Contexte) {
  try {
    await requirePermission("paiements", "lire");
    const { id } = await params;

    const quittance = await prisma.quittance.findUnique({
      where: { id },
      include: {
        paiement: {
          include: {
            facture: { include: { contrat: { include: { bien: true, locataire: true } } } },
          },
        },
      },
    });
    if (!quittance) throw new ApiError(404, "Quittance introuvable.");

    const buffer = await genererQuittancePdf(quittance);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="quittance-${quittance.numero}.pdf"`,
      },
    });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
