import { beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import {
  obtenirEvolutionCA,
  obtenirIndicateursImmobiliers,
  obtenirRepartitionBiens,
} from "@/lib/tableauDeBord";
import { nettoyerBase } from "./setup";

function identifiantCourt() {
  return randomUUID().slice(0, 8);
}

async function creerQuartier() {
  const commune = await prisma.commune.create({ data: { nom: `Commune-${identifiantCourt()}` } });
  return prisma.quartier.create({ data: { communeId: commune.id, nom: "Zone III" } });
}

beforeEach(async () => {
  await nettoyerBase();
});

describe("tableau de bord (CDC §16.2, §16.9)", () => {
  it("calcule le taux d'occupation à partir des statuts des biens", async () => {
    const quartier = await creerQuartier();
    await prisma.bien.createMany({
      data: [
        { code: `B-${identifiantCourt()}`, type: "appartement", designation: "A", quartierId: quartier.id, adresse: "x", loyer: 100000, statut: "occupe" },
        { code: `B-${identifiantCourt()}`, type: "appartement", designation: "B", quartierId: quartier.id, adresse: "x", loyer: 100000, statut: "occupe" },
        { code: `B-${identifiantCourt()}`, type: "villa", designation: "C", quartierId: quartier.id, adresse: "x", loyer: 100000, statut: "libre" },
        { code: `B-${identifiantCourt()}`, type: "villa", designation: "D", quartierId: quartier.id, adresse: "x", loyer: 100000, statut: "en_travaux" },
      ],
    });

    const indicateurs = await obtenirIndicateursImmobiliers();

    expect(indicateurs.total).toBe(4);
    expect(indicateurs.occupes).toBe(2);
    expect(indicateurs.libres).toBe(1);
    expect(indicateurs.travaux).toBe(1);
    expect(indicateurs.tauxOccupation).toBe(50);
  });

  it("regroupe les types de biens hors des 5 catégories nommées dans « Autres » (CDC §16.9)", async () => {
    const quartier = await creerQuartier();
    await prisma.bien.createMany({
      data: [
        { code: `B-${identifiantCourt()}`, type: "appartement", designation: "A", quartierId: quartier.id, adresse: "x", loyer: 100000 },
        { code: `B-${identifiantCourt()}`, type: "studio", designation: "B", quartierId: quartier.id, adresse: "x", loyer: 100000 },
        { code: `B-${identifiantCourt()}`, type: "terrain", designation: "C", quartierId: quartier.id, adresse: "x", loyer: 100000 },
      ],
    });

    const repartition = await obtenirRepartitionBiens();
    const parCategorie = Object.fromEntries(repartition.map((p) => [p.categorie, p.total]));

    expect(parCategorie["Appartement"]).toBe(1);
    expect(parCategorie["Autres"]).toBe(2); // studio + terrain
    expect(parCategorie["Villa"]).toBeUndefined(); // catégories vides filtrées
  });

  it("agrège le chiffre d'affaires (paiements encaissés) par mois", async () => {
    const quartier = await creerQuartier();
    const bien = await prisma.bien.create({
      data: { code: `B-${identifiantCourt()}`, type: "appartement", designation: "A", quartierId: quartier.id, adresse: "x", loyer: 100000 },
    });
    const locataire = await prisma.locataire.create({
      data: { code: `L-${identifiantCourt()}`, type: "physique", civilite: "M.", nom: "X", prenoms: "Y", dateNaissance: new Date("1990-01-01"), nationalite: "Ivoirienne", telephonePrincipal: "0700000000" },
    });
    const contrat = await prisma.contrat.create({
      data: { numero: `C-${identifiantCourt()}`, bienId: bien.id, locataireId: locataire.id, dateDebut: new Date("2026-01-01"), dateFin: new Date("2027-01-01"), montantLoyer: 100000, montantCaution: 200000, periodicite: "mensuelle", statut: "actif" },
    });
    const facture = await prisma.facture.create({
      data: { numero: `F-${identifiantCourt()}`, contratId: contrat.id, dateEmission: new Date("2026-08-25"), periode: "2026-09", montantLoyer: 100000, totalAPayer: 100000, soldeRestant: 100000, dateEcheance: new Date("2026-09-10") },
    });
    const utilisateur = await prisma.utilisateur.create({
      data: { nom: "Gestionnaire", email: `g-${identifiantCourt()}@cimec.local`, motDePasseHash: "hash", profil: "gestionnaire" },
    });
    await prisma.paiement.create({
      data: { reference: `P-${identifiantCourt()}`, factureId: facture.id, datePaiement: new Date("2026-09-05"), montant: 60000, mode: "especes", encaisseParId: utilisateur.id },
    });

    const evolution = await obtenirEvolutionCA(new Date("2026-09-15"), 3);
    const septembre = evolution.find((point) => point.mois.toLowerCase().startsWith("sept"));

    expect(septembre?.montant).toBe(60000);
  });
});
