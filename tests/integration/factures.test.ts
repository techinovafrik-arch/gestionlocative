import { beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { listerFacturesNonSoldees, TAILLE_PAGE_FACTURES_IMPAYEES } from "@/lib/factures";
import { nettoyerBase } from "./setup";

function identifiantCourt() {
  return randomUUID().slice(0, 8);
}

async function creerContexte() {
  const commune = await prisma.commune.create({ data: { nom: `Commune-${identifiantCourt()}` } });
  const quartier = await prisma.quartier.create({ data: { communeId: commune.id, nom: "Zone III" } });
  const bien = await prisma.bien.create({
    data: {
      code: `B-${identifiantCourt()}`,
      type: "appartement",
      designation: "Bien de test",
      quartierId: quartier.id,
      adresse: "1 rue de test",
      loyer: 150000,
      statut: "occupe",
    },
  });
  const locataire = await prisma.locataire.create({
    data: {
      code: `L-${identifiantCourt()}`,
      type: "physique",
      civilite: "M.",
      nom: "Test",
      prenoms: "Locataire",
      dateNaissance: new Date("1990-01-01"),
      nationalite: "Ivoirienne",
      telephonePrincipal: "0700000000",
    },
  });
  const contrat = await prisma.contrat.create({
    data: {
      numero: `C-${identifiantCourt()}`,
      bienId: bien.id,
      locataireId: locataire.id,
      dateDebut: new Date("2026-01-01"),
      dateFin: new Date("2027-01-01"),
      montantLoyer: 150000,
      montantCaution: 300000,
      periodicite: "mensuelle",
      statut: "actif",
    },
  });
  return contrat.id;
}

async function creerFacture(contratId: string, statut: "emise" | "partiellement_payee" | "impayee" | "payee", dateEcheance: Date, soldeRestant: number) {
  return prisma.facture.create({
    data: {
      numero: `F-${identifiantCourt()}`,
      contratId,
      dateEmission: new Date("2026-01-01"),
      periode: "2026-02",
      montantLoyer: 150000,
      totalAPayer: 150000,
      montantPaye: 150000 - soldeRestant,
      soldeRestant,
      statut,
      dateEcheance,
    },
  });
}

beforeEach(async () => {
  await nettoyerBase();
});

describe("factures impayées (D-045)", () => {
  it("inclut Émise, Partiellement payée et Impayée, exclut Payée", async () => {
    const contratId = await creerContexte();
    const maintenant = new Date("2026-06-15");
    await creerFacture(contratId, "emise", maintenant, 150000);
    await creerFacture(contratId, "partiellement_payee", maintenant, 50000);
    await creerFacture(contratId, "impayee", maintenant, 150000);
    await creerFacture(contratId, "payee", maintenant, 0);

    const resultat = await listerFacturesNonSoldees({ periode: "total", page: 1, maintenant });

    expect(resultat.total).toBe(3);
    expect(resultat.totalMontantDu).toBe(350000);
  });

  it("filtre 'jour' ne retient que l'échéance du jour même", async () => {
    const contratId = await creerContexte();
    const maintenant = new Date("2026-06-15T10:00:00Z");
    await creerFacture(contratId, "impayee", new Date("2026-06-15T00:00:00Z"), 150000);
    await creerFacture(contratId, "impayee", new Date("2026-06-14T00:00:00Z"), 150000);

    const resultat = await listerFacturesNonSoldees({ periode: "jour", page: 1, maintenant });

    expect(resultat.total).toBe(1);
  });

  it("filtre 'mois' retient les 30 derniers jours glissants", async () => {
    const contratId = await creerContexte();
    const maintenant = new Date("2026-06-15");
    await creerFacture(contratId, "impayee", new Date("2026-06-01"), 150000); // 14 jours avant
    await creerFacture(contratId, "impayee", new Date("2026-04-01"), 150000); // > 30 jours avant

    const resultat = await listerFacturesNonSoldees({ periode: "mois", page: 1, maintenant });

    expect(resultat.total).toBe(1);
  });

  it("filtre 'annee' retient l'année civile en cours uniquement", async () => {
    const contratId = await creerContexte();
    const maintenant = new Date("2026-06-15");
    await creerFacture(contratId, "impayee", new Date("2026-01-05"), 150000);
    await creerFacture(contratId, "impayee", new Date("2025-12-20"), 150000);

    const resultat = await listerFacturesNonSoldees({ periode: "annee", page: 1, maintenant });

    expect(resultat.total).toBe(1);
  });

  it("pagine par 10, le total porte sur l'ensemble filtré (pas seulement la page)", async () => {
    const contratId = await creerContexte();
    const maintenant = new Date("2026-06-15");
    for (let i = 0; i < 12; i++) {
      await creerFacture(contratId, "impayee", maintenant, 10000);
    }

    const page1 = await listerFacturesNonSoldees({ periode: "total", page: 1, maintenant });
    const page2 = await listerFacturesNonSoldees({ periode: "total", page: 2, maintenant });

    expect(page1.factures).toHaveLength(TAILLE_PAGE_FACTURES_IMPAYEES);
    expect(page2.factures).toHaveLength(2);
    expect(page1.total).toBe(12);
    expect(page1.totalMontantDu).toBe(120000);
    expect(page1.nombrePages).toBe(2);
  });
});
