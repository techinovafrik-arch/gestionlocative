// Transcription de dossier/14-securite-profils.md §14.1.
// Toute évolution de cette matrice doit d'abord être actée dans le dossier
// de conception (section 14), pas ici.

import type { ProfilUtilisateur } from "@/generated/prisma";

export type Ressource =
  | "biens"
  | "biens.statut"
  | "locataires"
  | "locataires.archivage"
  | "contrats"
  | "contrats.validation"
  | "revisionsLoyer.proposition"
  | "revisionsLoyer.validation"
  | "factures"
  | "paiements"
  | "paiements.correction"
  | "cautions"
  | "cautions.validation"
  | "documents"
  | "notifications.parametrage"
  | "rapports"
  | "tableauDeBord"
  | "utilisateurs"
  | "audit"
  | "import";

export type Action = "creer" | "lire" | "modifier" | "supprimer" | "valider";

const MATRICE: Record<Ressource, Partial<Record<ProfilUtilisateur, Action[]>>> = {
  biens: {
    administrateur: ["creer", "modifier", "lire"],
    gestionnaire: ["creer", "modifier", "lire"],
    gerant: ["lire"],
    consultation: ["lire"],
  },
  "biens.statut": {
    administrateur: ["modifier"],
    gestionnaire: ["modifier"],
  },
  locataires: {
    administrateur: ["creer", "modifier", "lire"],
    gestionnaire: ["creer", "modifier", "lire"],
    gerant: ["lire"],
    consultation: ["lire"],
  },
  "locataires.archivage": {
    administrateur: ["supprimer"],
    gestionnaire: ["supprimer"],
  },
  contrats: {
    gestionnaire: ["creer", "modifier"],
    administrateur: ["lire"],
    gerant: ["lire"],
    consultation: ["lire"],
  },
  "contrats.validation": {
    gerant: ["valider"],
  },
  "revisionsLoyer.proposition": {
    gestionnaire: ["creer"],
    gerant: ["creer"],
  },
  "revisionsLoyer.validation": {
    gerant: ["valider"],
  },
  factures: {
    administrateur: ["lire"],
    gerant: ["lire"],
    gestionnaire: ["lire"],
    consultation: ["lire"],
  },
  paiements: {
    gestionnaire: ["creer", "lire"],
    administrateur: ["lire"],
    gerant: ["lire"],
    consultation: ["lire"],
  },
  "paiements.correction": {
    gerant: ["valider"],
  },
  cautions: {
    gestionnaire: ["modifier", "lire"],
    administrateur: ["lire"],
    gerant: ["lire"],
    consultation: ["lire"],
  },
  "cautions.validation": {
    gerant: ["valider"],
  },
  documents: {
    administrateur: ["creer", "lire"],
    gestionnaire: ["creer", "lire"],
    gerant: ["lire"],
    consultation: ["lire"],
  },
  "notifications.parametrage": {
    administrateur: ["modifier"],
  },
  rapports: {
    administrateur: ["creer", "lire"],
    gerant: ["creer", "lire"],
    gestionnaire: ["lire"],
    consultation: ["lire"],
  },
  tableauDeBord: {
    administrateur: ["lire"],
    gerant: ["lire"],
    gestionnaire: ["lire"],
    consultation: ["lire"],
  },
  utilisateurs: {
    administrateur: ["creer", "modifier", "supprimer", "lire"],
  },
  audit: {
    administrateur: ["lire"],
    gerant: ["lire"],
  },
  // Reprise de données (D-011, EF-32) : opération sensible de démarrage,
  // non couverte par la matrice 14.1 (absente du dossier) — restreinte à
  // l'Administrateur par cohérence avec "Utilisateurs — gérer" (même niveau
  // de sensibilité : action irréversible en masse sur les données).
  import: {
    administrateur: ["creer", "lire"],
  },
};

export function peut(
  profil: ProfilUtilisateur,
  ressource: Ressource,
  action: Action,
): boolean {
  return MATRICE[ressource]?.[profil]?.includes(action) ?? false;
}
