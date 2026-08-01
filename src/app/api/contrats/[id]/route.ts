import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, requirePermission } from "@/lib/api";

type Contexte = { params: Promise<{ id: string }> };

const INCLUSION = {
  bien: true,
  locataire: true,
  caution: true,
  revisionsLoyer: true,
} as const;

export async function GET(_request: NextRequest, { params }: Contexte) {
  try {
    await requirePermission("contrats", "lire");
    const { id } = await params;

    const contrat = await prisma.contrat.findUnique({ where: { id }, include: INCLUSION });
    if (!contrat) throw new ApiError(404, "Contrat introuvable.");

    return NextResponse.json({ contrat });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
