import { beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { genererRapportMensuel } from "@/lib/rapportMensuel";
import { nettoyerBase } from "./setup";

function identifiantCourt() {
  return randomUUID().slice(0, 8);
}

beforeEach(async () => {
  await nettoyerBase();
});

// RG-N05 : synthèses immobilière et financière, notification interne au gérant.
describe("rapport mensuel automatique", () => {
  it("compile la synthèse immobilière et financière et notifie le gérant", async () => {
    const gerant = await prisma.utilisateur.create({
      data: {
        nom: "Gérant Test",
        email: `gerant-${identifiantCourt()}@cimec.local`,
        motDePasseHash: "hash",
        profil: "gerant",
      },
    });

    const commune = await prisma.commune.create({ data: { nom: `Commune-${identifiantCourt()}` } });
    const quartier = await prisma.quartier.create({ data: { communeId: commune.id, nom: "Zone III" } });
    await prisma.bien.create({
      data: {
        code: `BIEN-${identifiantCourt()}`,
        type: "appartement",
        designation: "Bien occupé",
        quartierId: quartier.id,
        adresse: "1 rue de test",
        loyer: 150000,
        statut: "occupe",
      },
    });
    await prisma.bien.create({
      data: {
        code: `BIEN-${identifiantCourt()}`,
        type: "villa",
        designation: "Bien libre",
        quartierId: quartier.id,
        adresse: "2 rue de test",
        loyer: 200000,
        statut: "libre",
      },
    });

    const synthese = await genererRapportMensuel(new Date("2026-09-15"));

    expect(synthese.totalBiens).toBe(2);
    expect(synthese.biensOccupes).toBe(1);
    expect(synthese.biensLibres).toBe(1);
    expect(synthese.tauxOccupation).toBe(50);

    const notifications = await prisma.notification.findMany({ where: { utilisateurId: gerant.id } });
    expect(notifications).toHaveLength(1);
    expect(notifications[0].titre).toContain("Rapport mensuel");
  });
});
