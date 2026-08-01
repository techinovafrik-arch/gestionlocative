// Ordre et clés de colonnes partagés entre le classeur modèle (modele.ts) et
// l'analyseur (analyser.ts), pour que les deux restent nécessairement alignés.

export const COLONNES_BIENS = [
  { header: "Code (optionnel)", key: "code", width: 18 },
  { header: "Type", key: "type", width: 16 },
  { header: "Désignation", key: "designation", width: 28 },
  { header: "Description (optionnel)", key: "description", width: 30 },
  { header: "Commune", key: "commune", width: 18 },
  { header: "Quartier", key: "quartier", width: 18 },
  { header: "Adresse", key: "adresse", width: 30 },
  { header: "Loyer (FCFA)", key: "loyer", width: 14 },
  { header: "Charges mensuelles (FCFA, optionnel)", key: "chargesMensuelles", width: 20 },
  { header: "Statut (optionnel, défaut : libre)", key: "statut", width: 16 },
] as const;

export const COLONNES_LOCATAIRES = [
  { header: "Code (optionnel)", key: "code", width: 18 },
  { header: "Type", key: "type", width: 14 },
  { header: "Civilité (physique)", key: "civilite", width: 12 },
  { header: "Nom (physique)", key: "nom", width: 18 },
  { header: "Prénoms (physique)", key: "prenoms", width: 20 },
  { header: "Date de naissance (physique)", key: "dateNaissance", width: 18 },
  { header: "Nationalité (physique)", key: "nationalite", width: 16 },
  { header: "Profession (physique, optionnel)", key: "profession", width: 18 },
  { header: "Raison sociale (entreprise)", key: "raisonSociale", width: 24 },
  { header: "Représentant (entreprise)", key: "representant", width: 20 },
  { header: "Infos administratives (entreprise, optionnel)", key: "infosAdministratives", width: 24 },
  { header: "Téléphone principal", key: "telephonePrincipal", width: 18 },
  { header: "Téléphone secondaire (optionnel)", key: "telephoneSecondaire", width: 20 },
  { header: "Email (optionnel)", key: "email", width: 22 },
  { header: "Type pièce identité", key: "typePieceIdentite", width: 18 },
  { header: "Numéro pièce identité", key: "numeroPieceIdentite", width: 20 },
  { header: "Date expiration pièce (optionnel)", key: "dateExpirationPiece", width: 20 },
] as const;

export const COLONNES_CONTRATS = [
  { header: "Numéro (optionnel)", key: "numero", width: 18 },
  { header: "Code bien", key: "codeBien", width: 18 },
  { header: "Code locataire", key: "codeLocataire", width: 18 },
  { header: "Date début", key: "dateDebut", width: 14 },
  { header: "Date fin", key: "dateFin", width: 14 },
  { header: "Loyer mensuel (FCFA)", key: "montantLoyer", width: 16 },
  { header: "Charges (FCFA, optionnel)", key: "charges", width: 16 },
  { header: "Montant caution (FCFA)", key: "montantCaution", width: 18 },
  { header: "Avance loyer (FCFA, optionnel)", key: "avanceLoyer", width: 18 },
  { header: "Périodicité", key: "periodicite", width: 14 },
  { header: "Date versement caution", key: "dateVersementCaution", width: 18 },
] as const;

export const MARQUEUR_LIGNE_EXEMPLE = "EXEMPLE";
