import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, requireSession } from "@/lib/api";

type Contexte = { params: Promise<{ id: string }> };

// PATCH /api/notifications/[id] — marquer comme lue (RG-N01).
export async function PATCH(_request: NextRequest, { params }: Contexte) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.utilisateurId !== session.user.id) {
      throw new ApiError(404, "Notification introuvable.");
    }

    const notificationMiseAJour = await prisma.notification.update({
      where: { id },
      data: { lue: true },
    });

    return NextResponse.json({ notification: notificationMiseAJour });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
