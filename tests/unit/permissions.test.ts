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
});
