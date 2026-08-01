import { beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { creerNotificationInterne, notifierStaff } from "@/lib/notifications/interne";
import { nettoyerBase } from "./setup";

function identifiantCourt() {
  return randomUUID().slice(0, 8);
}

async function creerUtilisateur(profil: "administrateur" | "gerant" | "gestionnaire" | "consultation", actif = true) {
  return prisma.utilisateur.create({
    data: {
      nom: `Utilisateur-${identifiantCourt()}`,
      email: `u-${identifiantCourt()}@cimec.local`,
      motDePasseHash: "hash",
      profil,
      actif,
    },
  });
}

beforeEach(async () => {
  await nettoyerBase();
});

describe("centre de notifications interne (RG-N01)", () => {
  it("crée une notification interne pour un utilisateur", async () => {
    const utilisateur = await creerUtilisateur("gerant");

    const notification = await creerNotificationInterne({
      utilisateurId: utilisateur.id,
      type: "information",
      titre: "Test",
      message: "Message de test",
    });

    expect(notification.utilisateurId).toBe(utilisateur.id);
    expect(notification.canal).toBe("interne");
    expect(notification.lue).toBe(false);
  });

  it("notifie tous les utilisateurs actifs des profils ciblés et aucun autre (RG-N02)", async () => {
    const gerant = await creerUtilisateur("gerant");
    const gerantInactif = await creerUtilisateur("gerant", false);
    const gestionnaire = await creerUtilisateur("gestionnaire");
    const administrateur = await creerUtilisateur("administrateur");

    const total = await notifierStaff({
      profils: ["gerant"],
      type: "action_requise",
      titre: "Titre",
      message: "Message",
    });

    expect(total).toBe(1);

    const notifications = await prisma.notification.findMany();
    expect(notifications).toHaveLength(1);
    expect(notifications[0].utilisateurId).toBe(gerant.id);

    const notifsInactif = await prisma.notification.findMany({
      where: { utilisateurId: gerantInactif.id },
    });
    expect(notifsInactif).toHaveLength(0);

    const notifsAutresProfils = await prisma.notification.findMany({
      where: { utilisateurId: { in: [gestionnaire.id, administrateur.id] } },
    });
    expect(notifsAutresProfils).toHaveLength(0);
  });
});
