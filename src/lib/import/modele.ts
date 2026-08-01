import ExcelJS from "exceljs";
import { TYPES_BIEN, STATUTS_BIEN } from "@/lib/validations/bien";
import { TYPES_LOCATAIRE, TYPES_PIECE_IDENTITE } from "@/lib/validations/locataire";
import { PERIODICITES } from "@/lib/validations/contrat";
import { COLONNES_BIENS, COLONNES_LOCATAIRES, COLONNES_CONTRATS } from "./colonnes";

// EF-32, D-011 : classeur modèle pour la reprise de données au démarrage —
// 3 feuilles (Biens, Locataires, Contrats) + une feuille d'instructions.
// Les colonnes reprennent exactement les clés attendues par
// src/lib/import/schemas.ts (analyse) et src/lib/import/executer.ts.
export async function genererModeleImport(): Promise<Buffer> {
  const classeur = new ExcelJS.Workbook();
  classeur.creator = "CIMEC — Gestion locative";
  classeur.created = new Date();

  const instructions = classeur.addWorksheet("Instructions");
  instructions.columns = [{ width: 100 }];
  instructions.addRows([
    ["Import initial des données existantes — Agence CISSE MEDOUNE (CIMEC)"],
    [""],
    ["1. Remplir la feuille « Biens », puis « Locataires », puis « Contrats » (dans cet ordre)."],
    ["2. Ne pas modifier les en-têtes de colonnes ni l'ordre des feuilles."],
    ["3. Le code (Bien/Locataire/Contrat) peut être laissé vide : il sera généré automatiquement."],
    ["4. Dans la feuille « Contrats », « Code bien » et « Code locataire » doivent correspondre à un code renseigné dans les feuilles « Biens »/« Locataires » de ce même classeur, ou à un code déjà existant dans l'application."],
    ["5. Les dates se saisissent au format JJ/MM/AAAA."],
    ["6. Les montants sont en FCFA, sans décimales."],
    ["7. Tous les contrats importés sont considérés « en cours » (actifs) — seuls les contrats actuellement en vigueur doivent être saisis ici."],
    ["8. Chaque feuille contient une ligne d'exemple commençant par « EXEMPLE — » : elle est ignorée automatiquement à l'import, mais il est conseillé de la supprimer avant de saisir vos données."],
    [""],
    [`Types de bien valides : ${TYPES_BIEN.join(", ")}`],
    [`Statuts de bien valides : ${STATUTS_BIEN.join(", ")}`],
    [`Types de locataire valides : ${TYPES_LOCATAIRE.join(", ")}`],
    [`Types de pièce d'identité valides : ${TYPES_PIECE_IDENTITE.join(", ")}`],
    [`Périodicités valides : ${PERIODICITES.join(", ")}`],
  ]);
  instructions.getRow(1).font = { bold: true, size: 13 };

  const biens = classeur.addWorksheet("Biens");
  biens.columns = [...COLONNES_BIENS];
  biens.addRow({
    code: "EXEMPLE — à supprimer",
    type: "appartement",
    designation: "Appartement 3 pièces",
    description: "",
    commune: "Treichville",
    quartier: "Zone III",
    adresse: "Rue 12, Treichville",
    loyer: 150000,
    chargesMensuelles: 0,
    statut: "occupe",
  });

  const locataires = classeur.addWorksheet("Locataires");
  locataires.columns = [...COLONNES_LOCATAIRES];
  locataires.addRow({
    code: "EXEMPLE — à supprimer",
    type: "physique",
    civilite: "M.",
    nom: "Kouassi",
    prenoms: "Jean",
    dateNaissance: "15/03/1985",
    nationalite: "Ivoirienne",
    profession: "Commerçant",
    telephonePrincipal: "0102030405",
    typePieceIdentite: "cni",
    numeroPieceIdentite: "CI0012345",
  });

  const contrats = classeur.addWorksheet("Contrats");
  contrats.columns = [...COLONNES_CONTRATS];
  contrats.addRow({
    numero: "EXEMPLE — à supprimer",
    codeBien: "BIEN-000001",
    codeLocataire: "LOC-000001",
    dateDebut: "01/01/2026",
    dateFin: "31/12/2026",
    montantLoyer: 150000,
    charges: 0,
    montantCaution: 300000,
    avanceLoyer: 0,
    periodicite: "mensuelle",
    dateVersementCaution: "01/01/2026",
  });

  for (const feuille of [biens, locataires, contrats]) {
    feuille.getRow(1).font = { bold: true };
    feuille.getRow(2).font = { italic: true, color: { argb: "FF888888" } };
  }

  const buffer = await classeur.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
