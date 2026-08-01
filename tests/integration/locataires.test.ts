import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { genererCodeLocataire } from "@/lib/codes";
import { nettoyerBase } from "./setup";

beforeEach(async () => {
  await nettoyerBase();
});

describe("locataires", () => {
  it("crée un locataire physique avec sa pièce d'identité (RG-L01, RG-L03)", async () => {
    const code = await genererCodeLocataire();

    const locataire = await prisma.locataire.create({
      data: {
        code,
        type: "physique",
        civilite: "M.",
        nom: "Kouassi",
        prenoms: "Jean",
        dateNaissance: new Date("1990-01-01"),
        nationalite: "Ivoirienne",
        telephonePrincipal: "0700000000",
        piecesIdentite: { create: { type: "cni", numero: "CI123" } },
      },
      include: { piecesIdentite: true },
    });

    expect(locataire.piecesIdentite).toHaveLength(1);
    expect(locataire.statut).toBe("actif");
  });

  it("crée un locataire entreprise (RG-L01)", async () => {
    const code = await genererCodeLocataire();

    const locataire = await prisma.locataire.create({
      data: {
        code,
        type: "entreprise",
        raisonSociale: "ACME SARL",
        representant: "Paul Yao",
        telephonePrincipal: "0700000001",
        piecesIdentite: { create: { type: "cni", numero: "CI789" } },
      },
    });

    expect(locataire.raisonSociale).toBe("ACME SARL");
  });

  it("archive un locataire et fixe la date d'archivage (RG-L04)", async () => {
    const code = await genererCodeLocataire();
    const locataire = await prisma.locataire.create({
      data: {
        code,
        type: "physique",
        civilite: "Mme",
        nom: "Bamba",
        prenoms: "Awa",
        dateNaissance: new Date("1992-05-20"),
        nationalite: "Ivoirienne",
        telephonePrincipal: "0700000002",
        piecesIdentite: { create: { type: "cni", numero: "CI456" } },
      },
    });

    const archive = await prisma.locataire.update({
      where: { id: locataire.id },
      data: { statut: "archive", dateArchivage: new Date() },
    });

    expect(archive.statut).toBe("archive");
    expect(archive.dateArchivage).not.toBeNull();
  });
});
