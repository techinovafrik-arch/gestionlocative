import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, requirePermission } from "@/lib/api";
import { enregistrerAudit } from "@/lib/audit";
import { bienModificationSchema, bienStatutSchema } from "@/lib/validations/bien";

type Contexte = { params: Promise<{ id: string }> };

const INCLUSION = { quartier: { include: { commune: true } } } as const;

export async function GET(_request: NextRequest, { params }: Contexte) {
  try {
    await requirePermission("biens", "lire");
    const { id } = await params;

    const bien = await prisma.bien.findUnique({ where: { id }, include: INCLUSION });
    if (!bien) throw new ApiError(404, "Bien introuvable.");

    return NextResponse.json({ bien });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}

// PATCH /api/biens/[id] — Administrateur, Gestionnaire locatif.
// Accepte soit des champs descriptifs (RG-B04), soit un changement de statut (RG-B03).
export async function PATCH(request: NextRequest, { params }: Contexte) {
  try {
    const session = await requirePermission("biens", "modifier");
    const { id } = await params;
    const corps = await request.json();

    const bienAvant = await prisma.bien.findUnique({ where: { id }, include: INCLUSION });
    if (!bienAvant) throw new ApiError(404, "Bien introuvable.");

    const donnees =
      "statut" in corps && Object.keys(corps).length === 1
        ? bienStatutSchema.parse(corps)
        : bienModificationSchema.parse(corps);

    const bien = await prisma.bien.update({
      where: { id },
      data: donnees,
      include: INCLUSION,
    });

    await enregistrerAudit({
      utilisateurId: session.user.id,
      action: "modification_bien",
      entiteType: "bien",
      entiteId: id,
      ancienneValeur: bienAvant,
      nouvelleValeur: bien,
    });

    return NextResponse.json({ bien });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
