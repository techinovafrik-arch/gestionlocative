import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requirePermission } from "@/lib/api";
import { enregistrerAudit } from "@/lib/audit";
import { genererCodeLocataire } from "@/lib/codes";
import { locataireCreationSchema } from "@/lib/validations/locataire";

const INCLUSION = { piecesIdentite: true } as const;

// GET /api/locataires — RG-L01, RG-L02, section 13 (« Liste des locataires actifs »).
export async function GET(request: NextRequest) {
  try {
    await requirePermission("locataires", "lire");

    const { searchParams } = new URL(request.url);
    const statut = searchParams.get("statut");

    const locataires = await prisma.locataire.findMany({
      where: statut ? { statut: statut as "actif" | "archive" } : { statut: "actif" },
      include: INCLUSION,
      orderBy: { code: "asc" },
    });

    return NextResponse.json({ locataires });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}

// POST /api/locataires — Administrateur, Gestionnaire locatif (RG-L01 à RG-L03).
export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("locataires", "creer");
    const donnees = locataireCreationSchema.parse(await request.json());
    const code = await genererCodeLocataire();

    const { pieceIdentite, ...champs } = donnees;

    const locataire = await prisma.locataire.create({
      data: {
        code,
        ...champs,
        piecesIdentite: { create: pieceIdentite },
      },
      include: INCLUSION,
    });

    await enregistrerAudit({
      utilisateurId: session.user.id,
      action: "creation_locataire",
      entiteType: "locataire",
      entiteId: locataire.id,
      nouvelleValeur: locataire,
    });

    return NextResponse.json({ locataire }, { status: 201 });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
