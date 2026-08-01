import { beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { ErreurDocument, rattacherDocument } from "@/lib/documents";
import { nettoyerBase } from "./setup";

function identifiantCourt() {
  return randomUUID().slice(0, 8);
}

async function creerBienEtUtilisateur() {
  const commune = await prisma.commune.create({ data: { nom: `Commune-${identifiantCourt()}` } });
  const quartier = await prisma.quartier.create({ data: { communeId: commune.id, nom: "Zone III" } });
  const bien = await prisma.bien.create({
    data: {
      code: `BIEN-${identifiantCourt()}`,
      type: "appartement",
      designation: "Bien de test",
      quartierId: quartier.id,
      adresse: "1 rue de test",
      loyer: 150000,
    },
  });
  const utilisateur = await prisma.utilisateur.create({
    data: {
      nom: "Gestionnaire Test",
      email: `gestionnaire-${identifiantCourt()}@cimec.local`,
      motDePasseHash: "hash",
      profil: "gestionnaire",
    },
  });
  return { bien, utilisateur };
}

beforeEach(async () => {
  await nettoyerBase();
});

describe("documents", () => {
  it("rattache un document à un bien existant (RG-D01, RG-D02)", async () => {
    const { bien, utilisateur } = await creerBienEtUtilisateur();

    const document = await rattacherDocument({
      typeDocument: "titre foncier",
      reference: "Titre foncier BIEN-TEST",
      lienSecurise: "https://drive.google.com/file/d/exemple",
      entiteType: "bien",
      entiteId: bien.id,
      ajouteParId: utilisateur.id,
    });

    expect(document.entiteType).toBe("bien");
    expect(document.entiteId).toBe(bien.id);
    expect(document.lienSecurise).toContain("drive.google.com");
  });

  it("refuse le rattachement à une entité inexistante", async () => {
    const { utilisateur } = await creerBienEtUtilisateur();

    await expect(
      rattacherDocument({
        typeDocument: "titre foncier",
        reference: "Référence orpheline",
        lienSecurise: "https://drive.google.com/file/d/inexistant",
        entiteType: "bien",
        entiteId: randomUUID(),
        ajouteParId: utilisateur.id,
      }),
    ).rejects.toThrow(ErreurDocument);
  });

  it("liste les documents rattachés à une entité précise", async () => {
    const { bien, utilisateur } = await creerBienEtUtilisateur();
    const autreBien = (await creerBienEtUtilisateur()).bien;

    await rattacherDocument({
      typeDocument: "titre foncier",
      reference: "Doc bien 1",
      lienSecurise: "https://drive.google.com/file/d/1",
      entiteType: "bien",
      entiteId: bien.id,
      ajouteParId: utilisateur.id,
    });
    await rattacherDocument({
      typeDocument: "titre foncier",
      reference: "Doc bien 2",
      lienSecurise: "https://drive.google.com/file/d/2",
      entiteType: "bien",
      entiteId: autreBien.id,
      ajouteParId: utilisateur.id,
    });

    const documentsDuBien = await prisma.document.findMany({
      where: { entiteType: "bien", entiteId: bien.id },
    });

    expect(documentsDuBien).toHaveLength(1);
    expect(documentsDuBien[0].reference).toBe("Doc bien 1");
  });
});
