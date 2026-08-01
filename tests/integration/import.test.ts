import { beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { COLONNES_BIENS, COLONNES_LOCATAIRES, COLONNES_CONTRATS } from "@/lib/import/colonnes";
import { analyserClasseur } from "@/lib/import/analyser";
import { executerImport, ErreurImport } from "@/lib/import/executer";
import { nettoyerBase } from "./setup";

function identifiantCourt() {
  return randomUUID().slice(0, 8);
}

async function construireClasseur(params: {
  biens?: Record<string, unknown>[];
  locataires?: Record<string, unknown>[];
  contrats?: Record<string, unknown>[];
}): Promise<Buffer> {
  const classeur = new ExcelJS.Workbook();

  const biens = classeur.addWorksheet("Biens");
  biens.columns = [...COLONNES_BIENS];
  for (const ligne of params.biens ?? []) biens.addRow(ligne);

  const locataires = classeur.addWorksheet("Locataires");
  locataires.columns = [...COLONNES_LOCATAIRES];
  for (const ligne of params.locataires ?? []) locataires.addRow(ligne);

  const contrats = classeur.addWorksheet("Contrats");
  contrats.columns = [...COLONNES_CONTRATS];
  for (const ligne of params.contrats ?? []) contrats.addRow(ligne);

  const buffer = await classeur.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

async function creerAdmin() {
  return prisma.utilisateur.create({
    data: {
      nom: "Admin Test",
      email: `admin-${identifiantCourt()}@cimec.local`,
      motDePasseHash: "hash",
      profil: "administrateur",
    },
  });
}

beforeEach(async () => {
  await nettoyerBase();
});

// EF-32, D-011 : import initial des biens/locataires/contrats en cours.
describe("import de données (EF-32, D-011)", () => {
  it("importe un classeur valide : biens, locataires et contrats liés", async () => {
    const admin = await creerAdmin();
    const codeBien = `BIEN-${identifiantCourt()}`;
    const codeLocataire = `LOC-${identifiantCourt()}`;

    const buffer = await construireClasseur({
      biens: [
        {
          code: codeBien,
          type: "appartement",
          designation: "Appartement test",
          commune: "Treichville",
          quartier: "Zone III",
          adresse: "1 rue test",
          loyer: 150000,
        },
      ],
      locataires: [
        {
          code: codeLocataire,
          type: "physique",
          civilite: "M.",
          nom: "Kouassi",
          prenoms: "Jean",
          dateNaissance: "15/03/1985",
          nationalite: "Ivoirienne",
          telephonePrincipal: "0102030405",
          typePieceIdentite: "cni",
          numeroPieceIdentite: "CI0012345",
        },
      ],
      contrats: [
        {
          codeBien,
          codeLocataire,
          dateDebut: "01/01/2026",
          dateFin: "31/12/2026",
          montantLoyer: 150000,
          montantCaution: 300000,
          periodicite: "mensuelle",
          dateVersementCaution: "01/01/2026",
        },
      ],
    });

    const analyse = await analyserClasseur(buffer);
    expect(analyse.erreurs).toEqual([]);
    expect(analyse.biens).toHaveLength(1);
    expect(analyse.locataires).toHaveLength(1);
    expect(analyse.contrats).toHaveLength(1);

    const resultat = await executerImport(analyse, admin.id);
    expect(resultat).toEqual({ biens: 1, locataires: 1, contrats: 1 });

    const bien = await prisma.bien.findUnique({ where: { code: codeBien } });
    expect(bien?.statut).toBe("occupe"); // occupé du fait du contrat importé

    const contrat = await prisma.contrat.findFirst({ where: { bienId: bien!.id }, include: { caution: true } });
    expect(contrat?.statut).toBe("actif");
    expect(contrat?.caution?.montantInitial.toString()).toBe("300000");

    const audits = await prisma.audit.findMany({ where: { utilisateurId: admin.id } });
    expect(audits.map((a) => a.action).sort()).toEqual(["import_bien", "import_contrat", "import_locataire"]);
  });

  it("détecte un code bien dupliqué dans le classeur", async () => {
    const codeBien = `BIEN-${identifiantCourt()}`;
    const buffer = await construireClasseur({
      biens: [
        { code: codeBien, type: "appartement", designation: "A", commune: "Treichville", quartier: "Zone III", adresse: "x", loyer: 100000 },
        { code: codeBien, type: "villa", designation: "B", commune: "Treichville", quartier: "Zone III", adresse: "y", loyer: 200000 },
      ],
    });

    const analyse = await analyserClasseur(buffer);

    expect(analyse.erreurs.some((e) => e.feuille === "Biens" && e.message.includes("en double"))).toBe(true);
  });

  it("détecte une référence de contrat vers un bien introuvable", async () => {
    const codeLocataire = `LOC-${identifiantCourt()}`;
    const buffer = await construireClasseur({
      locataires: [
        {
          code: codeLocataire,
          type: "physique",
          civilite: "M.",
          nom: "Kouassi",
          prenoms: "Jean",
          dateNaissance: "15/03/1985",
          nationalite: "Ivoirienne",
          telephonePrincipal: "0102030405",
          typePieceIdentite: "cni",
          numeroPieceIdentite: "CI0012345",
        },
      ],
      contrats: [
        {
          codeBien: "BIEN-INEXISTANT",
          codeLocataire,
          dateDebut: "01/01/2026",
          dateFin: "31/12/2026",
          montantLoyer: 150000,
          montantCaution: 300000,
          periodicite: "mensuelle",
          dateVersementCaution: "01/01/2026",
        },
      ],
    });

    const analyse = await analyserClasseur(buffer);

    expect(analyse.erreurs.some((e) => e.feuille === "Contrats" && e.message.includes("Bien introuvable"))).toBe(true);
  });

  it("refuse d'exécuter un classeur contenant encore des erreurs", async () => {
    const admin = await creerAdmin();
    const buffer = await construireClasseur({
      contrats: [
        {
          codeBien: "BIEN-INEXISTANT",
          codeLocataire: "LOC-INEXISTANT",
          dateDebut: "01/01/2026",
          dateFin: "31/12/2026",
          montantLoyer: 150000,
          montantCaution: 300000,
          periodicite: "mensuelle",
          dateVersementCaution: "01/01/2026",
        },
      ],
    });

    const analyse = await analyserClasseur(buffer);
    expect(analyse.erreurs.length).toBeGreaterThan(0);

    await expect(executerImport(analyse, admin.id)).rejects.toThrow(ErreurImport);
  });

  it("réutilise un quartier existant plutôt que d'en créer un doublon", async () => {
    const admin = await creerAdmin();
    const commune = await prisma.commune.create({ data: { nom: "Treichville" } });
    const quartier = await prisma.quartier.create({ data: { communeId: commune.id, nom: "Zone III" } });

    const codeBien = `BIEN-${identifiantCourt()}`;
    const buffer = await construireClasseur({
      biens: [
        { code: codeBien, type: "appartement", designation: "A", commune: "treichville", quartier: "zone iii", adresse: "x", loyer: 100000 },
      ],
    });

    const analyse = await analyserClasseur(buffer);
    await executerImport(analyse, admin.id);

    const bien = await prisma.bien.findUnique({ where: { code: codeBien } });
    expect(bien?.quartierId).toBe(quartier.id);

    const quartiers = await prisma.quartier.findMany({ where: { communeId: commune.id } });
    expect(quartiers).toHaveLength(1);
  });
});
