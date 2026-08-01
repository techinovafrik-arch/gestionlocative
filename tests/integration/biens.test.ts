import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { genererCodeBien } from "@/lib/codes";
import { nettoyerBase } from "./setup";

async function creerQuartier() {
  const commune = await prisma.commune.create({ data: { nom: "Treichville" } });
  return prisma.quartier.create({ data: { communeId: commune.id, nom: "Zone III" } });
}

beforeEach(async () => {
  await nettoyerBase();
});

describe("biens", () => {
  it("génère des codes séquentiels uniques (RG-B01)", async () => {
    const quartier = await creerQuartier();

    const code1 = await genererCodeBien();
    await prisma.bien.create({
      data: {
        code: code1,
        type: "appartement",
        designation: "Bien A",
        quartierId: quartier.id,
        adresse: "1 rue de test",
        loyer: 100000,
      },
    });

    const code2 = await genererCodeBien();

    expect(code2).not.toBe(code1);
    expect(code2).toBe("BIEN-000002");
  });

  it("refuse deux biens avec le même code (RG-B01)", async () => {
    const quartier = await creerQuartier();
    await prisma.bien.create({
      data: {
        code: "BIEN-DUPLIQUE",
        type: "villa",
        designation: "Bien A",
        quartierId: quartier.id,
        adresse: "1 rue de test",
        loyer: 100000,
      },
    });

    await expect(
      prisma.bien.create({
        data: {
          code: "BIEN-DUPLIQUE",
          type: "villa",
          designation: "Bien B",
          quartierId: quartier.id,
          adresse: "2 rue de test",
          loyer: 150000,
        },
      }),
    ).rejects.toThrow();
  });

  it("prend le statut 'libre' par défaut à la création (RG-B03)", async () => {
    const quartier = await creerQuartier();
    const bien = await prisma.bien.create({
      data: {
        code: "BIEN-STATUT",
        type: "studio",
        designation: "Bien A",
        quartierId: quartier.id,
        adresse: "1 rue de test",
        loyer: 100000,
      },
    });

    expect(bien.statut).toBe("libre");
  });
});
