import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requireSession } from "@/lib/api";

// GET /api/notifications — RG-N01 : centre de notifications interne, propre
// à chaque utilisateur (aucune permission de profil : ce sont ses données).
export async function GET() {
  try {
    const session = await requireSession();

    const notifications = await prisma.notification.findMany({
      where: { utilisateurId: session.user.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ notifications });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
