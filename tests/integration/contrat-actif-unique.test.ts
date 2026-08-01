import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { nettoyerBase } from "./setup";

async function creerBien(code: string) {
  const commune = await prisma.commune.create({ data: { nom: `Commune-${code}` } });
  const quartier = await prisma.quartier.create({
    data: { communeId: commune.id, nom: `Quartier-${code}` },
  });
  return prisma.bien.create({
    data: {
      code,
      type: "appartement",
      designation: "Bien de test",
      quartierId: quartier.id,
      adresse: "1 rue de test",
      loyer: 100000,
    },
  });
}

async function creerLocataire(code: string) {
  return prisma.locataire.create({
    data: {
      code,
      type: "physique",
      civilite: "M.",
      nom: "Test",
      prenoms: code,
      dateNaissance: new Date("1990-01-01"),
      nationalite: "Ivoirienne",
      telephonePrincipal: "0700000000",
    },
  });
}

beforeEach(async () => {
  await nettoyerBase();
});

describe("règle : un seul contrat actif par bien (section 09 - MCD, RG-B05)", () => {
  it("refuse un second contrat 'actif' sur un bien déjà pourvu d'un contrat actif", async () => {
    const bien = await creerBien("BIEN-CTR");
    const locataire1 = await creerLocataire("LOC-CTR-1");
    const locataire2 = await creerLocataire("LOC-CTR-2");

    await prisma.contrat.create({
      data: {
        numero: "CTR-0001",
        bienId: bien.id,
        locataireId: locataire1.id,
        dateDebut: new Date("2026-01-01"),
        dateFin: new Date("2027-01-01"),
        montantLoyer: 100000,
        montantCaution: 200000,
        periodicite: "mensuelle",
        statut: "actif",
      },
    });

    await expect(
      prisma.contrat.create({
        data: {
          numero: "CTR-0002",
          bienId: bien.id,
          locataireId: locataire2.id,
          dateDebut: new Date("2026-01-01"),
          dateFin: new Date("2027-01-01"),
          montantLoyer: 100000,
          montantCaution: 200000,
          periodicite: "mensuelle",
          statut: "actif",
        },
      }),
    ).rejects.toThrow();
  });

  it("autorise un contrat brouillon en parallèle d'un contrat actif sur le même bien", async () => {
    const bien = await creerBien("BIEN-CTR-2");
    const locataire1 = await creerLocataire("LOC-CTR-3");
    const locataire2 = await creerLocataire("LOC-CTR-4");

    await prisma.contrat.create({
      data: {
        numero: "CTR-0003",
        bienId: bien.id,
        locataireId: locataire1.id,
        dateDebut: new Date("2026-01-01"),
        dateFin: new Date("2027-01-01"),
        montantLoyer: 100000,
        montantCaution: 200000,
        periodicite: "mensuelle",
        statut: "actif",
      },
    });

    const brouillon = await prisma.contrat.create({
      data: {
        numero: "CTR-0004",
        bienId: bien.id,
        locataireId: locataire2.id,
        dateDebut: new Date("2026-02-01"),
        dateFin: new Date("2027-02-01"),
        montantLoyer: 100000,
        montantCaution: 200000,
        periodicite: "mensuelle",
        statut: "brouillon",
      },
    });

    expect(brouillon.statut).toBe("brouillon");
  });

  it("autorise un nouveau contrat actif après clôture du précédent (renouvellement)", async () => {
    const bien = await creerBien("BIEN-CTR-3");
    const locataire = await creerLocataire("LOC-CTR-5");

    const premier = await prisma.contrat.create({
      data: {
        numero: "CTR-0005",
        bienId: bien.id,
        locataireId: locataire.id,
        dateDebut: new Date("2025-01-01"),
        dateFin: new Date("2026-01-01"),
        montantLoyer: 100000,
        montantCaution: 200000,
        periodicite: "mensuelle",
        statut: "actif",
      },
    });

    await prisma.contrat.update({
      where: { id: premier.id },
      data: { statut: "termine" },
    });

    const second = await prisma.contrat.create({
      data: {
        numero: "CTR-0006",
        bienId: bien.id,
        locataireId: locataire.id,
        dateDebut: new Date("2026-01-01"),
        dateFin: new Date("2027-01-01"),
        montantLoyer: 100000,
        montantCaution: 200000,
        periodicite: "mensuelle",
        statut: "actif",
        contratParentId: premier.id,
      },
    });

    expect(second.statut).toBe("actif");
  });
});
