import { beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { genererFacturesDuCycle } from "@/lib/facturation";
import { nettoyerBase } from "./setup";

function identifiantCourt() {
  return randomUUID().slice(0, 8);
}

async function creerContratActif(overrides: {
  periodicite: "mensuelle" | "trimestrielle" | "annuelle";
  montantLoyer: number;
  charges?: number;
  dateDebut: Date;
}) {
  const commune = await prisma.commune.create({ data: { nom: "Treichville" } });
  const quartier = await prisma.quartier.create({ data: { communeId: commune.id, nom: "Zone III" } });
  const bien = await prisma.bien.create({
    data: {
      code: `BIEN-${identifiantCourt()}`,
      type: "appartement",
      designation: "Bien de test",
      quartierId: quartier.id,
      adresse: "1 rue de test",
      loyer: overrides.montantLoyer,
      statut: "occupe",
    },
  });
  const locataire = await prisma.locataire.create({
    data: {
      code: `LOC-${identifiantCourt()}`,
      type: "physique",
      civilite: "M.",
      nom: "Test",
      prenoms: "Locataire",
      dateNaissance: new Date("1990-01-01"),
      nationalite: "Ivoirienne",
      telephonePrincipal: "0700000000",
    },
  });

  return prisma.contrat.create({
    data: {
      numero: `CTR-${identifiantCourt()}`,
      bienId: bien.id,
      locataireId: locataire.id,
      dateDebut: overrides.dateDebut,
      dateFin: new Date("2030-01-01"),
      montantLoyer: overrides.montantLoyer,
      charges: overrides.charges ?? 0,
      montantCaution: overrides.montantLoyer * 2,
      periodicite: overrides.periodicite,
      statut: "actif",
    },
  });
}

beforeEach(async () => {
  await nettoyerBase();
});

describe("facturation", () => {
  it("génère la facture mensuelle du mois suivant, en mois plein (RG-F01, RG-F06)", async () => {
    const contrat = await creerContratActif({
      periodicite: "mensuelle",
      montantLoyer: 150000,
      charges: 10000,
      dateDebut: new Date("2026-08-10"), // entrée en cours de mois : pas de prorata attendu
    });

    const maintenant = new Date("2026-08-25");
    const factures = await genererFacturesDuCycle(maintenant);

    expect(factures).toHaveLength(1);
    const facture = await prisma.facture.findFirst({ where: { contratId: contrat.id } });
    expect(facture?.periode).toBe("2026-09");
    expect(facture?.montantLoyer.toString()).toBe("150000"); // mois plein, pas de prorata
    expect(facture?.charges.toString()).toBe("10000");
    expect(facture?.totalAPayer.toString()).toBe("160000");
    expect(facture?.dateEcheance.toISOString().slice(0, 10)).toBe("2026-09-10");
  });

  it("ne génère pas deux fois la même période (idempotence)", async () => {
    await creerContratActif({
      periodicite: "mensuelle",
      montantLoyer: 150000,
      dateDebut: new Date("2026-08-01"),
    });

    const maintenant = new Date("2026-08-25");
    const premierPassage = await genererFacturesDuCycle(maintenant);
    const secondPassage = await genererFacturesDuCycle(maintenant);

    expect(premierPassage).toHaveLength(1);
    expect(secondPassage).toHaveLength(0);
  });

  it("reporte le solde impayé en arriérés sur la facture suivante et marque l'ancienne facture 'impayée'", async () => {
    const contrat = await creerContratActif({
      periodicite: "mensuelle",
      montantLoyer: 150000,
      dateDebut: new Date("2026-08-01"),
    });

    await genererFacturesDuCycle(new Date("2026-08-25")); // génère la facture de septembre

    // On se place après l'échéance (10/09) et avant le cycle d'octobre.
    const maintenantSeptembre = new Date("2026-09-25");
    const factures = await genererFacturesDuCycle(maintenantSeptembre);

    expect(factures).toHaveLength(1);

    const factureSeptembre = await prisma.facture.findFirst({
      where: { contratId: contrat.id, periode: "2026-09" },
    });
    expect(factureSeptembre?.statut).toBe("impayee");

    const factureOctobre = await prisma.facture.findFirst({
      where: { contratId: contrat.id, periode: "2026-10" },
    });
    expect(factureOctobre?.arrieres.toString()).toBe("150000");
    expect(factureOctobre?.totalAPayer.toString()).toBe("300000");
  });

  it("génère une facture globale cumulée pour un contrat trimestriel, payée d'avance (RG-F08, D-021)", async () => {
    const contrat = await creerContratActif({
      periodicite: "trimestrielle",
      montantLoyer: 300000,
      charges: 20000,
      dateDebut: new Date("2026-08-01"),
    });

    const factures = await genererFacturesDuCycle(new Date("2026-08-01"));

    expect(factures).toHaveLength(1);
    const facture = await prisma.facture.findFirst({ where: { contratId: contrat.id } });
    expect(facture?.montantLoyer.toString()).toBe("900000"); // 300 000 x 3 mois
    expect(facture?.charges.toString()).toBe("60000");
    expect(facture?.periode).toBe("20260801-20261101");
    expect(facture?.dateEcheance.toISOString().slice(0, 10)).toBe("2026-08-01"); // payée d'avance
  });

  it("ignore les contrats non actifs (brouillon, terminé)", async () => {
    const brouillon = await creerContratActif({
      periodicite: "mensuelle",
      montantLoyer: 150000,
      dateDebut: new Date("2026-08-01"),
    });
    await prisma.contrat.update({ where: { id: brouillon.id }, data: { statut: "brouillon" } });

    const factures = await genererFacturesDuCycle(new Date("2026-08-25"));
    expect(factures).toHaveLength(0);
  });
});
