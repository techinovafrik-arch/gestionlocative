import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, requirePermission } from "@/lib/api";
import { enregistrerAudit } from "@/lib/audit";
import { locataireModificationSchema } from "@/lib/validations/locataire";

type Contexte = { params: Promise<{ id: string }> };

const INCLUSION = { piecesIdentite: true } as const;

export async function GET(_request: NextRequest, { params }: Contexte) {
  try {
    await requirePermission("locataires", "lire");
    const { id } = await params;

    const locataire = await prisma.locataire.findUnique({ where: { id }, include: INCLUSION });
    if (!locataire) throw new ApiError(404, "Locataire introuvable.");

    return NextResponse.json({ locataire });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}

// PATCH /api/locataires/[id] — Administrateur, Gestionnaire locatif.
export async function PATCH(request: NextRequest, { params }: Contexte) {
  try {
    const session = await requirePermission("locataires", "modifier");
    const { id } = await params;
    const donnees = locataireModificationSchema.parse(await request.json());

    const locataireAvant = await prisma.locataire.findUnique({
      where: { id },
      include: INCLUSION,
    });
    if (!locataireAvant) throw new ApiError(404, "Locataire introuvable.");

    const locataire = await prisma.locataire.update({
      where: { id },
      data: donnees,
      include: INCLUSION,
    });

    await enregistrerAudit({
      utilisateurId: session.user.id,
      action: "modification_locataire",
      entiteType: "locataire",
      entiteId: id,
      ancienneValeur: locataireAvant,
      nouvelleValeur: locataire,
    });

    return NextResponse.json({ locataire });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}

// DELETE /api/locataires/[id] — archivage (RG-L04) : historique conservé,
// données personnelles purgées automatiquement après 1 an (traitement différé,
// hors périmètre de cette route).
export async function DELETE(_request: NextRequest, { params }: Contexte) {
  try {
    const session = await requirePermission("locataires.archivage", "supprimer");
    const { id } = await params;

    const locataireAvant = await prisma.locataire.findUnique({
      where: { id },
      include: INCLUSION,
    });
    if (!locataireAvant) throw new ApiError(404, "Locataire introuvable.");

    const locataire = await prisma.locataire.update({
      where: { id },
      data: { statut: "archive", dateArchivage: new Date() },
      include: INCLUSION,
    });

    await enregistrerAudit({
      utilisateurId: session.user.id,
      action: "archivage_locataire",
      entiteType: "locataire",
      entiteId: id,
      ancienneValeur: locataireAvant,
      nouvelleValeur: locataire,
    });

    return NextResponse.json({ locataire });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
