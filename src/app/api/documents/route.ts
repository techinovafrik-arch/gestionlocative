import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { EntiteDocument } from "@/generated/prisma";
import { handleApiError, requirePermission } from "@/lib/api";
import { enregistrerAudit } from "@/lib/audit";
import { rattacherDocument } from "@/lib/documents";
import { documentCreationSchema } from "@/lib/validations/document";

// GET /api/documents — RG-D02 (section 6.1 : consulter les documents rattachés
// à une fiche). Filtres optionnels entiteType + entiteId.
export async function GET(request: NextRequest) {
  try {
    await requirePermission("documents", "lire");

    const { searchParams } = new URL(request.url);
    const entiteType = searchParams.get("entiteType") as EntiteDocument | null;
    const entiteId = searchParams.get("entiteId") ?? undefined;

    const documents = await prisma.document.findMany({
      where: {
        entiteType: entiteType ?? undefined,
        entiteId,
      },
      include: { ajoutePar: { select: { nom: true } } },
      orderBy: { dateAjout: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}

// POST /api/documents — Administrateur, Gestionnaire locatif (RG-D01, RG-D02).
export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("documents", "creer");
    const donnees = documentCreationSchema.parse(await request.json());

    const document = await rattacherDocument({ ...donnees, ajouteParId: session.user.id });

    await enregistrerAudit({
      utilisateurId: session.user.id,
      action: "rattachement_document",
      entiteType: "document",
      entiteId: document.id,
      nouvelleValeur: document,
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
