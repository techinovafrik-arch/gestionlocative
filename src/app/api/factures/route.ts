import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requirePermission } from "@/lib/api";

// GET /api/factures — génération exclusivement automatique (RG-F01) ; pas de
// création manuelle. Lecture ouverte à tous les profils (RG-F04, section 13).
// Filtres optionnels : locataireId, dues=true (statuts non « payée »,
// triées par échéance croissante — RG-P06, préparation de l'écran paiement).
export async function GET(request: NextRequest) {
  try {
    await requirePermission("factures", "lire");

    const { searchParams } = new URL(request.url);
    const locataireId = searchParams.get("locataireId") ?? undefined;
    const dues = searchParams.get("dues") === "true";

    const factures = await prisma.facture.findMany({
      where: {
        contrat: locataireId ? { locataireId } : undefined,
        statut: dues ? { in: ["emise", "partiellement_payee", "impayee"] } : undefined,
      },
      include: { contrat: { include: { bien: true, locataire: true } } },
      orderBy: dues ? { dateEcheance: "asc" } : { dateEmission: "desc" },
    });

    return NextResponse.json({ factures });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
