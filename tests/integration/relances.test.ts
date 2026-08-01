import { beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { envoyerAlertesEcheance, envoyerRelancesImpayes } from "@/lib/relances";
import { nettoyerBase } from "./setup";

function identifiantCourt() {
  return randomUUID().slice(0, 8);
}

async function creerContexte() {
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
  const contrat = await prisma.contrat.create({
    data: {
      numero: `CTR-${identifiantCourt()}`,
      bienId: bien.id,
      locataireId: locataire.id,
      dateDebut: new Date("2026-08-01"),
      dateFin: new Date("2027-08-01"),
      montantLoyer: 150000,
      montantCaution: 300000,
      periodicite: "mensuelle",
      statut: "actif",
    },
  });
  return { contrat };
}

async function creerFacture(
  contratId: string,
  overrides: { statut: "emise" | "impayee"; dateEcheance: Date },
) {
  return prisma.facture.create({
    data: {
      numero: `FAC-${identifiantCourt()}`,
      contratId,
      dateEmission: new Date("2026-08-25"),
      periode: "2026-09",
      montantLoyer: 150000,
      charges: 0,
      arrieres: 0,
      totalAPayer: 150000,
      montantPaye: 0,
      soldeRestant: 150000,
      statut: overrides.statut,
      dateEcheance: overrides.dateEcheance,
    },
  });
}

beforeEach(async () => {
  await nettoyerBase();
});

describe("relances locataire (RG-N04)", () => {
  it("envoie une alerte échéance pour une facture due sous 5 jours et la marque comme envoyée", async () => {
    const { contrat } = await creerContexte();
    const maintenant = new Date("2026-09-06");
    await creerFacture(contrat.id, { statut: "emise", dateEcheance: new Date("2026-09-10") });

    const total = await envoyerAlertesEcheance(maintenant);
    expect(total).toBe(1);

    const facture = await prisma.facture.findFirst({ where: { contratId: contrat.id } });
    expect(facture?.alerteEcheanceEnvoyee).toBe(true);
  });

  it("n'envoie l'alerte échéance qu'une seule fois (idempotence)", async () => {
    const { contrat } = await creerContexte();
    const maintenant = new Date("2026-09-06");
    await creerFacture(contrat.id, { statut: "emise", dateEcheance: new Date("2026-09-10") });

    await envoyerAlertesEcheance(maintenant);
    const second = await envoyerAlertesEcheance(maintenant);

    expect(second).toBe(0);
  });

  it("n'alerte pas une facture dont l'échéance est trop lointaine", async () => {
    const { contrat } = await creerContexte();
    const maintenant = new Date("2026-08-25");
    await creerFacture(contrat.id, { statut: "emise", dateEcheance: new Date("2026-09-10") });

    const total = await envoyerAlertesEcheance(maintenant);
    expect(total).toBe(0);
  });

  it("envoie une relance pour une facture impayée et la marque comme relancée", async () => {
    const { contrat } = await creerContexte();
    await creerFacture(contrat.id, { statut: "impayee", dateEcheance: new Date("2026-09-10") });

    const total = await envoyerRelancesImpayes();
    expect(total).toBe(1);

    const facture = await prisma.facture.findFirst({ where: { contratId: contrat.id } });
    expect(facture?.relanceImpayeEnvoyee).toBe(true);
  });

  it("n'envoie la relance impayé qu'une seule fois (idempotence)", async () => {
    const { contrat } = await creerContexte();
    await creerFacture(contrat.id, { statut: "impayee", dateEcheance: new Date("2026-09-10") });

    await envoyerRelancesImpayes();
    const second = await envoyerRelancesImpayes();

    expect(second).toBe(0);
  });
});
