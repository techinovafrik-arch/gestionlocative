import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { handleApiError, requirePermission } from "@/lib/api";
import { enregistrerAudit } from "@/lib/audit";
import { utilisateurCreationSchema } from "@/lib/validations/utilisateur";

// GET /api/utilisateurs — RG-U01, section 12 (écran Gestion des utilisateurs).
export async function GET() {
  try {
    await requirePermission("utilisateurs", "lire");

    const utilisateurs = await prisma.utilisateur.findMany({
      select: {
        id: true,
        nom: true,
        email: true,
        profil: true,
        actif: true,
        createdAt: true,
      },
      orderBy: { nom: "asc" },
    });

    return NextResponse.json({ utilisateurs });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}

// POST /api/utilisateurs — Administrateur uniquement (RG-U01, section 14.1).
export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("utilisateurs", "creer");
    const donnees = utilisateurCreationSchema.parse(await request.json());

    const emailExistant = await prisma.utilisateur.findUnique({
      where: { email: donnees.email },
    });
    if (emailExistant) {
      return NextResponse.json(
        { erreur: "Cet email est déjà utilisé par un autre compte." },
        { status: 409 },
      );
    }

    const motDePasseHash = await bcrypt.hash(donnees.motDePasse, 12);

    const utilisateur = await prisma.utilisateur.create({
      data: {
        nom: donnees.nom,
        email: donnees.email,
        motDePasseHash,
        profil: donnees.profil,
      },
      select: {
        id: true,
        nom: true,
        email: true,
        profil: true,
        actif: true,
        createdAt: true,
      },
    });

    await enregistrerAudit({
      utilisateurId: session.user.id,
      action: "creation_utilisateur",
      entiteType: "utilisateur",
      entiteId: utilisateur.id,
      nouvelleValeur: utilisateur,
    });

    return NextResponse.json({ utilisateur }, { status: 201 });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
