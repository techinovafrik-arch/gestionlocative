import { prisma } from "@/lib/prisma";
import type { ProfilUtilisateur, TypeNotification } from "@/generated/prisma";
import { envoyerEmail } from "@/lib/notifications/canaux";

// RG-N01 : centre de notifications interne par utilisateur.
export async function creerNotificationInterne(params: {
  utilisateurId: string;
  type: TypeNotification;
  titre: string;
  message: string;
}) {
  return prisma.notification.create({
    data: {
      utilisateurId: params.utilisateurId,
      type: params.type,
      titre: params.titre,
      message: params.message,
      canal: "interne",
      date: new Date(),
    },
  });
}

// RG-N02 : emails automatiques aux profils Administrateur, Gérant, Gestionnaire
// (+ notification interne systématique). L'email est actuellement en stub
// (voir lib/notifications/canaux.ts) tant que le fournisseur n'est pas choisi.
export async function notifierStaff(params: {
  profils: ProfilUtilisateur[];
  type: TypeNotification;
  titre: string;
  message: string;
}) {
  const destinataires = await prisma.utilisateur.findMany({
    where: { profil: { in: params.profils }, actif: true },
  });

  for (const utilisateur of destinataires) {
    await creerNotificationInterne({
      utilisateurId: utilisateur.id,
      type: params.type,
      titre: params.titre,
      message: params.message,
    });

    await envoyerEmail({
      destinataire: utilisateur.email,
      sujet: params.titre,
      corps: params.message,
    });
  }

  return destinataires.length;
}
