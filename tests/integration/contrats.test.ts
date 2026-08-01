import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { genererNumeroContrat } from "@/lib/codes";
import { nettoyerBase } from "./setup";

async function creerBienEtLocataire() {
  const commune = await prisma.commune.create({ data: { nom: "Treichville" } });
  const quartier = await prisma.quartier.create({ data: { communeId: commune.id, nom: "Zone III" } });
  const bien = await prisma.bien.create({
    data: {
      code: "BIEN-CONTRAT",
      type: "appartement",
      designation: "Bien de test",
      quartierId: quartier.id,
      adresse: "1 rue de test",
      loyer: 150000,
    },
  });
  const locataire = await prisma.locataire.create({
    data: {
      code: "LOC-CONTRAT",
      type: "physique",
      civilite: "M.",
      nom: "Test",
      prenoms: "Locataire",
      dateNaissance: new Date("1990-01-01"),
      nationalite: "Ivoirienne",
      telephonePrincipal: "0700000000",
    },
  });
  return { bien, locataire };
}

beforeEach(async () => {
  await nettoyerBase();
});

describe("contrats", () => {
  it("génère des numéros de contrat séquentiels uniques (RG-C02)", async () => {
    const { bien, locataire } = await creerBienEtLocataire();
    const numero1 = await genererNumeroContrat();
    await prisma.contrat.create({
      data: {
        numero: numero1,
        bienId: bien.id,
        locataireId: locataire.id,
        dateDebut: new Date("2026-01-01"),
        dateFin: new Date("2027-01-01"),
        montantLoyer: 150000,
        montantCaution: 300000,
        periodicite: "mensuelle",
        statut: "brouillon",
      },
    });

    const numero2 = await genererNumeroContrat();
    expect(numero2).not.toBe(numero1);
    expect(numero2).toBe("CTR-000002");
  });

  it("crée un contrat avec sa caution associée en une seule opération (RG-K01)", async () => {
    const { bien, locataire } = await creerBienEtLocataire();
    const numero = await genererNumeroContrat();

    const contrat = await prisma.contrat.create({
      data: {
        numero,
        bienId: bien.id,
        locataireId: locataire.id,
        dateDebut: new Date("2026-01-01"),
        dateFin: new Date("2027-01-01"),
        montantLoyer: 150000,
        montantCaution: 300000,
        periodicite: "mensuelle",
        statut: "brouillon",
        caution: {
          create: { montantInitial: 300000, dateVersement: new Date("2026-01-01"), statut: "detenue" },
        },
      },
      include: { caution: true },
    });

    expect(contrat.caution?.montantInitial.toString()).toBe("300000");
    expect(contrat.statut).toBe("brouillon");
  });

  it("refuse une seconde caution sur le même contrat (relation 1-1)", async () => {
    const { bien, locataire } = await creerBienEtLocataire();
    const numero = await genererNumeroContrat();

    const contrat = await prisma.contrat.create({
      data: {
        numero,
        bienId: bien.id,
        locataireId: locataire.id,
        dateDebut: new Date("2026-01-01"),
        dateFin: new Date("2027-01-01"),
        montantLoyer: 150000,
        montantCaution: 300000,
        periodicite: "mensuelle",
        statut: "brouillon",
      },
    });

    await prisma.caution.create({
      data: { contratId: contrat.id, montantInitial: 300000, dateVersement: new Date(), statut: "detenue" },
    });

    await expect(
      prisma.caution.create({
        data: { contratId: contrat.id, montantInitial: 300000, dateVersement: new Date(), statut: "detenue" },
      }),
    ).rejects.toThrow();
  });

  it("applique le nouveau loyer au contrat après validation d'une révision (RG-C07)", async () => {
    const { bien, locataire } = await creerBienEtLocataire();
    const gerant = await prisma.utilisateur.create({
      data: {
        nom: "Gérant Test",
        email: "gerant-test@cimec.local",
        motDePasseHash: "hash",
        profil: "gerant",
      },
    });
    const numero = await genererNumeroContrat();

    const contrat = await prisma.contrat.create({
      data: {
        numero,
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

    const revision = await prisma.revisionLoyer.create({
      data: {
        contratId: contrat.id,
        ancienMontant: contrat.montantLoyer,
        nouveauMontant: 160000,
        dateModification: new Date(),
        motif: "Revalorisation annuelle",
        demandeParId: gerant.id,
      },
    });

    expect(revision.valideParId).toBeNull();

    const [revisionValidee, contratMisAJour] = await prisma.$transaction([
      prisma.revisionLoyer.update({
        where: { id: revision.id },
        data: { valideParId: gerant.id },
      }),
      prisma.contrat.update({
        where: { id: contrat.id },
        data: { montantLoyer: revision.nouveauMontant },
      }),
    ]);

    expect(revisionValidee.valideParId).toBe(gerant.id);
    expect(contratMisAJour.montantLoyer.toString()).toBe("160000");
    expect(revisionValidee.ancienMontant.toString()).toBe("150000");
  });
});
