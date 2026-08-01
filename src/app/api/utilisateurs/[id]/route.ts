import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, requirePermission } from "@/lib/api";
import { enregistrerAudit } from "@/lib/audit";
import { utilisateurModificationSchema } from "@/lib/validations/utilisateur";

type Contexte = { params: Promise<{ id: string }> };

const SELECTION = {
  id: true,
  nom: true,
  email: true,
  profil: true,
  actif: true,
  createdAt: true,
} as const;

export async function GET(_request: NextRequest, { params }: Contexte) {
  try {
    await requirePermission("utilisateurs", "lire");
    const { id } = await params;

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id },
      select: SELECTION,
    });
    if (!utilisateur) throw new ApiError(404, "Utilisateur introuvable.");

    return NextResponse.json({ utilisateur });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}

// PATCH /api/utilisateurs/[id] — Administrateur uniquement.
export async function PATCH(request: NextRequest, { params }: Contexte) {
  try {
    const session = await requirePermission("utilisateurs", "modifier");
    const { id } = await params;
    const donnees = utilisateurModificationSchema.parse(await request.json());

    const utilisateurAvant = await prisma.utilisateur.findUnique({
      where: { id },
      select: SELECTION,
    });
    if (!utilisateurAvant) throw new ApiError(404, "Utilisateur introuvable.");

    const { motDePasse, ...reste } = donnees;

    const utilisateur = await prisma.utilisateur.update({
      where: { id },
      data: {
        ...reste,
        ...(motDePasse ? { motDePasseHash: await bcrypt.hash(motDePasse, 12) } : {}),
      },
      select: SELECTION,
    });

    await enregistrerAudit({
      utilisateurId: session.user.id,
      action: "modification_utilisateur",
      entiteType: "utilisateur",
      entiteId: id,
      ancienneValeur: utilisateurAvant,
      nouvelleValeur: utilisateur,
    });

    return NextResponse.json({ utilisateur });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}

// DELETE /api/utilisateurs/[id] — désactivation (suppression logique, section 10).
export async function DELETE(_request: NextRequest, { params }: Contexte) {
  try {
    const session = await requirePermission("utilisateurs", "supprimer");
    const { id } = await params;

    const utilisateurAvant = await prisma.utilisateur.findUnique({
      where: { id },
      select: SELECTION,
    });
    if (!utilisateurAvant) throw new ApiError(404, "Utilisateur introuvable.");

    const utilisateur = await prisma.utilisateur.update({
      where: { id },
      data: { actif: false },
      select: SELECTION,
    });

    await enregistrerAudit({
      utilisateurId: session.user.id,
      action: "desactivation_utilisateur",
      entiteType: "utilisateur",
      entiteId: id,
      ancienneValeur: utilisateurAvant,
      nouvelleValeur: utilisateur,
    });

    return NextResponse.json({ utilisateur });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
