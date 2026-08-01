import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, requirePermission } from "@/lib/api";
import { genererFacturePdf } from "@/lib/pdf/facture";

type Contexte = { params: Promise<{ id: string }> };

// GET /api/factures/[id]/pdf — RG-F02, RG-F04 (consultable, téléchargeable).
// L'envoi par email (RG-F04) sera branché au Sprint 6 une fois le fournisseur
// email choisi (technique/00-cadrage-technique.md §6, point 3).
export async function GET(_request: NextRequest, { params }: Contexte) {
  try {
    await requirePermission("factures", "lire");
    const { id } = await params;

    const facture = await prisma.facture.findUnique({
      where: { id },
      include: { contrat: { include: { bien: true, locataire: true } } },
    });
    if (!facture) throw new ApiError(404, "Facture introuvable.");

    const buffer = await genererFacturePdf(facture);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="facture-${facture.numero}.pdf"`,
      },
    });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
