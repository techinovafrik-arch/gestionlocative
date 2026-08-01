import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, requirePermission } from "@/lib/api";

type Contexte = { params: Promise<{ id: string }> };

const INCLUSION = {
  facture: { include: { contrat: { include: { bien: true, locataire: true } } } },
  encaissePar: { select: { id: true, nom: true } },
  quittance: true,
} as const;

export async function GET(_request: NextRequest, { params }: Contexte) {
  try {
    await requirePermission("paiements", "lire");
    const { id } = await params;

    const paiement = await prisma.paiement.findUnique({ where: { id }, include: INCLUSION });
    if (!paiement) throw new ApiError(404, "Paiement introuvable.");

    return NextResponse.json({ paiement });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
