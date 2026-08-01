import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requirePermission } from "@/lib/api";

// GET /api/factures — génération exclusivement automatique (RG-F01) ; pas de
// création manuelle. Lecture ouverte à tous les profils (RG-F04, section 13).
export async function GET() {
  try {
    await requirePermission("factures", "lire");

    const factures = await prisma.facture.findMany({
      include: { contrat: { include: { bien: true, locataire: true } } },
      orderBy: { dateEmission: "desc" },
    });

    return NextResponse.json({ factures });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
