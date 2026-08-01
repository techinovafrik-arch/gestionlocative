import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, requirePermission } from "@/lib/api";
import { enregistrerAudit } from "@/lib/audit";
import { genererCodeBien } from "@/lib/codes";
import { bienCreationSchema, bienFiltresSchema } from "@/lib/validations/bien";

// GET /api/biens — RG-B01 à RG-B04, section 13 (rapport « Liste des biens »).
export async function GET(request: NextRequest) {
  try {
    await requirePermission("biens", "lire");

    const { searchParams } = new URL(request.url);
    const filtres = bienFiltresSchema.parse({
      type: searchParams.get("type") ?? undefined,
      statut: searchParams.get("statut") ?? undefined,
      quartierId: searchParams.get("quartierId") ?? undefined,
    });

    const biens = await prisma.bien.findMany({
      where: filtres,
      include: { quartier: { include: { commune: true } } },
      orderBy: { code: "asc" },
    });

    return NextResponse.json({ biens });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}

// POST /api/biens — Administrateur, Gestionnaire locatif (RG-B01).
export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("biens", "creer");
    const donnees = bienCreationSchema.parse(await request.json());

    const quartier = await prisma.quartier.findUnique({
      where: { id: donnees.quartierId },
    });
    if (!quartier) throw new ApiError(400, "Quartier introuvable.");

    const code = donnees.code ?? (await genererCodeBien());

    const codeExistant = await prisma.bien.findUnique({ where: { code } });
    if (codeExistant) {
      throw new ApiError(409, `Le code bien "${code}" est déjà utilisé.`);
    }

    const bien = await prisma.bien.create({
      data: {
        code,
        type: donnees.type,
        designation: donnees.designation,
        description: donnees.description,
        quartierId: donnees.quartierId,
        adresse: donnees.adresse,
        loyer: donnees.loyer,
        chargesMensuelles: donnees.chargesMensuelles,
      },
      include: { quartier: { include: { commune: true } } },
    });

    await enregistrerAudit({
      utilisateurId: session.user.id,
      action: "creation_bien",
      entiteType: "bien",
      entiteId: bien.id,
      nouvelleValeur: bien,
    });

    return NextResponse.json({ bien }, { status: 201 });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
