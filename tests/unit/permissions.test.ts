import { describe, expect, it } from "vitest";
import { peut } from "@/lib/permissions";

// Vérifie la matrice de dossier/14-securite-profils.md §14.1.
describe("permissions", () => {
  it("autorise le gestionnaire locatif à créer un bien", () => {
    expect(peut("gestionnaire", "biens", "creer")).toBe(true);
  });

  it("refuse au gestionnaire locatif de valider un contrat", () => {
    expect(peut("gestionnaire", "contrats.validation", "valider")).toBe(false);
  });

  it("autorise uniquement le gérant à valider un contrat", () => {
    expect(peut("gerant", "contrats.validation", "valider")).toBe(true);
  });

  it("autorise uniquement le gérant à valider la correction d'un paiement", () => {
    expect(peut("gerant", "paiements.correction", "valider")).toBe(true);
    expect(peut("administrateur", "paiements.correction", "valider")).toBe(false);
    expect(peut("gestionnaire", "paiements.correction", "valider")).toBe(false);
  });

  it("limite le profil consultation à la lecture", () => {
    expect(peut("consultation", "biens", "lire")).toBe(true);
    expect(peut("consultation", "biens", "creer")).toBe(false);
    expect(peut("consultation", "biens", "modifier")).toBe(false);
  });

  it("réserve la gestion des utilisateurs à l'administrateur", () => {
    expect(peut("administrateur", "utilisateurs", "creer")).toBe(true);
    expect(peut("gerant", "utilisateurs", "creer")).toBe(false);
    expect(peut("gestionnaire", "utilisateurs", "creer")).toBe(false);
  });

  it("autorise le gestionnaire locatif à consulter les contrats (§14.1, corrigé Sprint 9)", () => {
    expect(peut("gestionnaire", "contrats", "lire")).toBe(true);
  });

  it("autorise l'administrateur et le gestionnaire à générer une facture manuellement (D-042)", () => {
    expect(peut("administrateur", "factures", "creer")).toBe(true);
    expect(peut("gestionnaire", "factures", "creer")).toBe(true);
    expect(peut("gerant", "factures", "creer")).toBe(false);
    expect(peut("consultation", "factures", "creer")).toBe(false);
  });

  it("retire la création/modification des contrats et l'enregistrement des paiements au gestionnaire locatif, repris par gérant et administrateur (D-043)", () => {
    expect(peut("gestionnaire", "contrats", "creer")).toBe(false);
    expect(peut("gestionnaire", "contrats", "modifier")).toBe(false);
    expect(peut("gestionnaire", "contrats", "lire")).toBe(true);
    expect(peut("gestionnaire", "paiements", "creer")).toBe(false);
    expect(peut("gestionnaire", "paiements", "lire")).toBe(true);

    expect(peut("gerant", "contrats", "creer")).toBe(true);
    expect(peut("gerant", "contrats", "modifier")).toBe(true);
    expect(peut("gerant", "paiements", "creer")).toBe(true);

    expect(peut("administrateur", "contrats", "creer")).toBe(true);
    expect(peut("administrateur", "contrats", "modifier")).toBe(true);
    expect(peut("administrateur", "paiements", "creer")).toBe(true);
  });

  it("réserve l'import de données à l'administrateur (D-041)", () => {
    expect(peut("administrateur", "import", "creer")).toBe(true);
    expect(peut("administrateur", "import", "lire")).toBe(true);
    expect(peut("gerant", "import", "creer")).toBe(false);
    expect(peut("gestionnaire", "import", "creer")).toBe(false);
    expect(peut("consultation", "import", "lire")).toBe(false);
  });
});
