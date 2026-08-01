import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, requirePermission } from "@/lib/api";

type Contexte = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Contexte) {
  try {
    await requirePermission("factures", "lire");
    const { id } = await params;

    const facture = await prisma.facture.findUnique({
      where: { id },
      include: { contrat: { include: { bien: true, locataire: true } }, paiements: true },
    });
    if (!facture) throw new ApiError(404, "Facture introuvable.");

    return NextResponse.json({ facture });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
