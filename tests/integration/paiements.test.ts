import { beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { corrigerPaiement, enregistrerPaiement, ErreurPaiement } from "@/lib/paiements";
import { nettoyerBase } from "./setup";

function identifiantCourt() {
  return randomUUID().slice(0, 8);
}

async function creerContexte() {
  const commune = await prisma.commune.create({ data: { nom: "Treichville" } });
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
  const utilisateur = await prisma.utilisateur.create({
    data: {
      nom: "Gestionnaire Test",
      email: `gestionnaire-${identifiantCourt()}@cimec.local`,
      motDePasseHash: "hash",
      profil: "gestionnaire",
    },
  });

  return { locataire, contrat, utilisateur };
}

async function creerFacture(contratId: string, overrides: { periode: string; dateEcheance: Date; totalAPayer: number }) {
  return prisma.facture.create({
    data: {
      numero: `FAC-${identifiantCourt()}`,
      contratId,
      dateEmission: new Date("2026-08-25"),
      periode: overrides.periode,
      montantLoyer: overrides.totalAPayer,
      charges: 0,
      arrieres: 0,
      totalAPayer: overrides.totalAPayer,
      montantPaye: 0,
      soldeRestant: overrides.totalAPayer,
      statut: "emise",
      dateEcheance: overrides.dateEcheance,
    },
  });
}

beforeEach(async () => {
  await nettoyerBase();
});

describe("paiements", () => {
  it("enregistre un paiement partiel et génère la quittance (RG-P01, RG-P05)", async () => {
    const { locataire, contrat, utilisateur } = await creerContexte();
    const facture = await creerFacture(contrat.id, {
      periode: "2026-09",
      dateEcheance: new Date("2026-09-10"),
      totalAPayer: 160000,
    });

    const resultat = await enregistrerPaiement({
      locataireId: locataire.id,
      montant: 100000,
      mode: "orange_money",
      datePaiement: new Date("2026-09-05"),
      encaisseParId: utilisateur.id,
    });

    expect(resultat.facture.id).toBe(facture.id);
    expect(resultat.facture.montantPaye.toString()).toBe("100000");
    expect(resultat.facture.soldeRestant.toString()).toBe("60000");
    expect(resultat.facture.statut).toBe("partiellement_payee");
    expect(resultat.quittance.paiementId).toBe(resultat.paiement.id);
  });

  it("solde intégralement la facture quand le montant couvre le solde restant (RG-P01)", async () => {
    const { locataire, contrat, utilisateur } = await creerContexte();
    await creerFacture(contrat.id, {
      periode: "2026-09",
      dateEcheance: new Date("2026-09-10"),
      totalAPayer: 160000,
    });

    const resultat = await enregistrerPaiement({
      locataireId: locataire.id,
      montant: 160000,
      mode: "especes",
      datePaiement: new Date("2026-09-08"),
      encaisseParId: utilisateur.id,
    });

    expect(resultat.facture.statut).toBe("payee");
    expect(resultat.facture.soldeRestant.toString()).toBe("0");
  });

  it("impute le paiement sur la facture la plus ancienne due (RG-P06)", async () => {
    const { locataire, contrat, utilisateur } = await creerContexte();
    const factureAncienne = await creerFacture(contrat.id, {
      periode: "2026-08",
      dateEcheance: new Date("2026-08-10"),
      totalAPayer: 160000,
    });
    await creerFacture(contrat.id, {
      periode: "2026-09",
      dateEcheance: new Date("2026-09-10"),
      totalAPayer: 160000,
    });

    const resultat = await enregistrerPaiement({
      locataireId: locataire.id,
      montant: 50000,
      mode: "wave",
      datePaiement: new Date("2026-09-01"),
      encaisseParId: utilisateur.id,
    });

    expect(resultat.paiement.factureId).toBe(factureAncienne.id);
  });

  it("refuse un paiement supérieur au solde restant de la facture ciblée", async () => {
    const { locataire, contrat, utilisateur } = await creerContexte();
    await creerFacture(contrat.id, {
      periode: "2026-09",
      dateEcheance: new Date("2026-09-10"),
      totalAPayer: 160000,
    });

    await expect(
      enregistrerPaiement({
        locataireId: locataire.id,
        montant: 200000,
        mode: "especes",
        datePaiement: new Date("2026-09-05"),
        encaisseParId: utilisateur.id,
      }),
    ).rejects.toThrow(ErreurPaiement);
  });

  it("refuse un paiement quand aucune facture n'est due", async () => {
    const { locataire, utilisateur } = await creerContexte();

    await expect(
      enregistrerPaiement({
        locataireId: locataire.id,
        montant: 10000,
        mode: "especes",
        datePaiement: new Date("2026-09-05"),
        encaisseParId: utilisateur.id,
      }),
    ).rejects.toThrow(ErreurPaiement);
  });

  it("recalcule la facture après correction d'un paiement (RG-P04)", async () => {
    const { locataire, contrat, utilisateur } = await creerContexte();
    await creerFacture(contrat.id, {
      periode: "2026-09",
      dateEcheance: new Date("2026-09-10"),
      totalAPayer: 160000,
    });

    const { paiement } = await enregistrerPaiement({
      locataireId: locataire.id,
      montant: 160000,
      mode: "especes",
      datePaiement: new Date("2026-09-08"),
      encaisseParId: utilisateur.id,
    });

    const correction = await corrigerPaiement({
      paiementId: paiement.id,
      nouveauMontant: 150000,
    });

    expect(correction.paiement.statut).toBe("corrige");
    expect(correction.paiement.montant.toString()).toBe("150000");
    expect(correction.facture.montantPaye.toString()).toBe("150000");
    expect(correction.facture.soldeRestant.toString()).toBe("10000");
    expect(correction.facture.statut).toBe("partiellement_payee");
  });
});
