import { beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { facturesImpayees } from "@/lib/rapports/financier";
import { balanceImpayes, syntheseLoyers } from "@/lib/rapports/synthese";
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
      dateDebut: new Date("2026-08-01"),
      dateFin: new Date("2027-08-01"),
      montantLoyer: 150000,
      montantCaution: 300000,
      periodicite: "mensuelle",
      statut: "actif",
    },
  });
  return { locataire, contrat };
}

async function creerFactureImpayee(contratId: string, dateEcheance: Date, soldeRestant: number) {
  return prisma.facture.create({
    data: {
      numero: `F-${identifiantCourt()}`,
      contratId,
      dateEmission: new Date("2026-08-25"),
      periode: "2026-09",
      montantLoyer: soldeRestant,
      totalAPayer: soldeRestant,
      montantPaye: 0,
      soldeRestant,
      statut: "impayee",
      dateEcheance,
    },
  });
}

beforeEach(async () => {
  await nettoyerBase();
});

describe("rapports financiers (CDC §16.6, §16.8)", () => {
  it("calcule les jours de retard d'une facture impayée", async () => {
    const { contrat } = await creerContexte();
    const ilYA10Jours = new Date();
    ilYA10Jours.setDate(ilYA10Jours.getDate() - 10);
    await creerFactureImpayee(contrat.id, ilYA10Jours, 150000);

    const factures = await facturesImpayees(new Date());

    expect(factures).toHaveLength(1);
    expect(factures[0].joursRetard).toBeGreaterThanOrEqual(9);
    expect(factures[0].joursRetard).toBeLessThanOrEqual(11);
  });

  it("cumule le montant dû et retient le plus grand retard par locataire (balance des impayés)", async () => {
    const { contrat, locataire } = await creerContexte();
    const maintenant = new Date("2026-10-01");
    await creerFactureImpayee(contrat.id, new Date("2026-09-01"), 100000); // 30 jours
    await creerFactureImpayee(contrat.id, new Date("2026-09-20"), 50000); // 11 jours

    const balances = await balanceImpayes(maintenant);

    expect(balances).toHaveLength(1);
    expect(balances[0].locataire.id).toBe(locataire.id);
    expect(balances[0].montantDu).toBe(150000);
    expect(balances[0].joursRetard).toBe(30);
  });

  it("calcule l'écart entre prévision et réalisation par période", async () => {
    const { contrat } = await creerContexte();
    const maintenant = new Date("2026-09-15");

    const facture = await prisma.facture.create({
      data: {
        numero: `F-${identifiantCourt()}`,
        contratId: contrat.id,
        dateEmission: new Date("2026-09-01"),
        periode: "2026-09",
        montantLoyer: 150000,
        totalAPayer: 150000,
        montantPaye: 100000,
        soldeRestant: 50000,
        statut: "partiellement_payee",
        dateEcheance: new Date("2026-09-10"),
      },
    });

    const utilisateur = await prisma.utilisateur.create({
      data: {
        nom: "Gestionnaire",
        email: `g-${identifiantCourt()}@cimec.local`,
        motDePasseHash: "hash",
        profil: "gestionnaire",
      },
    });
    await prisma.paiement.create({
      data: {
        reference: `P-${identifiantCourt()}`,
        factureId: facture.id,
        datePaiement: new Date("2026-09-05"),
        montant: 100000,
        mode: "especes",
        encaisseParId: utilisateur.id,
      },
    });

    const synthese = await syntheseLoyers(maintenant);
    const moisCourant = synthese.find((ligne) => ligne.periode === "Mois courant");

    expect(moisCourant?.prevision).toBe(150000);
    expect(moisCourant?.realisation).toBe(100000);
    expect(moisCourant?.ecart).toBe(-50000);
  });
});
