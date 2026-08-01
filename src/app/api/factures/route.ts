import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requirePermission } from "@/lib/api";
import { enregistrerAudit } from "@/lib/audit";
import { genererFacturePourContrat } from "@/lib/facturation";
import { factureGenerationSchema } from "@/lib/validations/facture";

// GET /api/factures — génération de masse exclusivement automatique
// (RG-F01, via /api/cron/facturation) ; POST ci-dessous ne couvre que la
// génération manuelle ciblée sur un contrat (D-042). Lecture ouverte à tous
// les profils (RG-F04, section 13). Filtres optionnels : locataireId,
// dues=true (statuts non « payée », triées par échéance croissante —
// RG-P06, préparation de l'écran paiement).
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

// POST /api/factures — génération manuelle d'une facture pour UN contrat
// (D-042), Administrateur et Gestionnaire locatif. Réutilise exactement les
// règles de src/lib/facturation.ts (aucun montant/période saisi ici).
export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("factures", "creer");
    const { contratId } = factureGenerationSchema.parse(await request.json());

    const facture = await genererFacturePourContrat(contratId);

    await enregistrerAudit({
      utilisateurId: session.user.id,
      action: "generation_manuelle_facture",
      entiteType: "facture",
      entiteId: facture.id,
      nouvelleValeur: facture,
    });

    return NextResponse.json({ facture }, { status: 201 });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
