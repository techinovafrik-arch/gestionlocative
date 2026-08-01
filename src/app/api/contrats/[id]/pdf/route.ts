import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, requirePermission } from "@/lib/api";
import { genererContratPdf } from "@/lib/pdf/contrat";

type Contexte = { params: Promise<{ id: string }> };

// GET /api/contrats/[id]/pdf — RG-C06, D-035 (contrat PDF, 2 trames).
export async function GET(_request: NextRequest, { params }: Contexte) {
  try {
    await requirePermission("contrats", "lire");
    const { id } = await params;

    const contrat = await prisma.contrat.findUnique({
      where: { id },
      include: { bien: true, locataire: true },
    });
    if (!contrat) throw new ApiError(404, "Contrat introuvable.");

    const buffer = await genererContratPdf(contrat);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="contrat-${contrat.numero}.pdf"`,
      },
    });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
