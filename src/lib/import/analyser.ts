import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { COLONNES_BIENS, COLONNES_LOCATAIRES, COLONNES_CONTRATS, MARQUEUR_LIGNE_EXEMPLE } from "./colonnes";
import {
  ligneBienSchema,
  ligneLocataireSchema,
  ligneContratSchema,
  type LigneBien,
  type LigneLocataire,
  type LigneContrat,
} from "./schemas";

export type ErreurImport = { feuille: string; ligne: number; message: string };

export type LigneValidee<T> = { ligneExcel: number; donnees: T };

export type ResultatAnalyse = {
  erreurs: ErreurImport[];
  biens: LigneValidee<LigneBien>[];
  locataires: LigneValidee<LigneLocataire>[];
  contrats: LigneValidee<LigneContrat>[];
};

function valeurCellule(valeur: ExcelJS.CellValue): string | number | Date | undefined {
  if (valeur === null || valeur === undefined) return undefined;
  if (valeur instanceof Date) return valeur;
  if (typeof valeur === "string" || typeof valeur === "number") return valeur;
  if (typeof valeur === "object") {
    if ("richText" in valeur && Array.isArray(valeur.richText)) {
      return valeur.richText.map((partie) => partie.text).join("");
    }
    if ("text" in valeur && typeof valeur.text === "string") return valeur.text;
    if ("result" in valeur && valeur.result !== undefined) {
      return valeurCellule(valeur.result as ExcelJS.CellValue);
    }
  }
  return String(valeur);
}

function ligneEstExemple(premiereValeur: unknown): boolean {
  return typeof premiereValeur === "string" && premiereValeur.trim().startsWith(MARQUEUR_LIGNE_EXEMPLE);
}

function lireFeuille(
  classeur: ExcelJS.Workbook,
  nomFeuille: string,
  colonnes: ReadonlyArray<{ key: string }>,
): { ligneExcel: number; brut: Record<string, unknown> }[] {
  const feuille = classeur.getWorksheet(nomFeuille);
  if (!feuille) return [];

  const lignes: { ligneExcel: number; brut: Record<string, unknown> }[] = [];
  feuille.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // en-tête

    const brut: Record<string, unknown> = {};
    colonnes.forEach((colonne, index) => {
      brut[colonne.key] = valeurCellule(row.getCell(index + 1).value);
    });

    if (ligneEstExemple(brut[colonnes[0].key])) return;

    const toutesVides = Object.values(brut).every((v) => v === undefined || v === "");
    if (toutesVides) return;

    lignes.push({ ligneExcel: rowNumber, brut });
  });

  return lignes;
}

// EF-32, D-011 : analyse d'un classeur d'import — validation ligne à ligne
// (schemas.ts) puis contrôles de cohérence croisés (codes uniques, références
// bien/locataire résolubles, un seul contrat actif par bien — RG applicables
// à la création normale, cf. dossier §10.3). N'écrit rien en base.
export async function analyserClasseur(buffer: Buffer): Promise<ResultatAnalyse> {
  const classeur = new ExcelJS.Workbook();
  await classeur.xlsx.load(buffer as unknown as ArrayBuffer);

  const erreurs: ErreurImport[] = [];
  const biensValides: LigneValidee<LigneBien>[] = [];
  const locatairesValides: LigneValidee<LigneLocataire>[] = [];
  const contratsValides: LigneValidee<LigneContrat>[] = [];

  for (const nom of ["Biens", "Locataires", "Contrats"]) {
    if (!classeur.getWorksheet(nom)) {
      erreurs.push({ feuille: nom, ligne: 0, message: `Feuille « ${nom} » absente du classeur.` });
    }
  }
  if (erreurs.length > 0) return { erreurs, biens: [], locataires: [], contrats: [] };

  for (const { ligneExcel, brut } of lireFeuille(classeur, "Biens", COLONNES_BIENS)) {
    const resultat = ligneBienSchema.safeParse(brut);
    if (!resultat.success) {
      for (const probleme of resultat.error.issues) {
        erreurs.push({ feuille: "Biens", ligne: ligneExcel, message: probleme.message });
      }
      continue;
    }
    biensValides.push({ ligneExcel, donnees: resultat.data });
  }

  for (const { ligneExcel, brut } of lireFeuille(classeur, "Locataires", COLONNES_LOCATAIRES)) {
    const resultat = ligneLocataireSchema.safeParse(brut);
    if (!resultat.success) {
      for (const probleme of resultat.error.issues) {
        erreurs.push({ feuille: "Locataires", ligne: ligneExcel, message: probleme.message });
      }
      continue;
    }
    locatairesValides.push({ ligneExcel, donnees: resultat.data });
  }

  for (const { ligneExcel, brut } of lireFeuille(classeur, "Contrats", COLONNES_CONTRATS)) {
    const resultat = ligneContratSchema.safeParse(brut);
    if (!resultat.success) {
      for (const probleme of resultat.error.issues) {
        erreurs.push({ feuille: "Contrats", ligne: ligneExcel, message: probleme.message });
      }
      continue;
    }
    contratsValides.push({ ligneExcel, donnees: resultat.data });
  }

  // --- Contrôles de cohérence croisés (uniquement sur les lignes déjà valides) ---

  const codesBiensVus = new Map<string, number>();
  for (const { ligneExcel, donnees } of biensValides) {
    if (!donnees.code) continue;
    if (codesBiensVus.has(donnees.code)) {
      erreurs.push({ feuille: "Biens", ligne: ligneExcel, message: `Code bien « ${donnees.code} » en double dans le classeur.` });
    }
    codesBiensVus.set(donnees.code, ligneExcel);
    if (await prisma.bien.findUnique({ where: { code: donnees.code } })) {
      erreurs.push({ feuille: "Biens", ligne: ligneExcel, message: `Code bien « ${donnees.code} » déjà utilisé dans l'application.` });
    }
  }

  const codesLocatairesVus = new Map<string, number>();
  for (const { ligneExcel, donnees } of locatairesValides) {
    if (!donnees.code) continue;
    if (codesLocatairesVus.has(donnees.code)) {
      erreurs.push({ feuille: "Locataires", ligne: ligneExcel, message: `Code locataire « ${donnees.code} » en double dans le classeur.` });
    }
    codesLocatairesVus.set(donnees.code, ligneExcel);
    if (await prisma.locataire.findUnique({ where: { code: donnees.code } })) {
      erreurs.push({ feuille: "Locataires", ligne: ligneExcel, message: `Code locataire « ${donnees.code} » déjà utilisé dans l'application.` });
    }
  }

  const numerosContratsVus = new Map<string, number>();
  const biensReferences = new Map<string, number>(); // codeBien -> ligne du premier contrat qui le référence

  for (const { ligneExcel, donnees } of contratsValides) {
    if (donnees.numero) {
      if (numerosContratsVus.has(donnees.numero)) {
        erreurs.push({ feuille: "Contrats", ligne: ligneExcel, message: `Numéro de contrat « ${donnees.numero} » en double dans le classeur.` });
      }
      numerosContratsVus.set(donnees.numero, ligneExcel);
      if (await prisma.contrat.findUnique({ where: { numero: donnees.numero } })) {
        erreurs.push({ feuille: "Contrats", ligne: ligneExcel, message: `Numéro de contrat « ${donnees.numero} » déjà utilisé dans l'application.` });
      }
    }

    const bienDansClasseur = codesBiensVus.has(donnees.codeBien);
    const bienExistant = bienDansClasseur || (await prisma.bien.findUnique({ where: { code: donnees.codeBien } })) !== null;
    if (!bienExistant) {
      erreurs.push({ feuille: "Contrats", ligne: ligneExcel, message: `Bien introuvable pour le code « ${donnees.codeBien} » (feuille Biens ou base existante).` });
    } else {
      if (biensReferences.has(donnees.codeBien)) {
        erreurs.push({ feuille: "Contrats", ligne: ligneExcel, message: `Le bien « ${donnees.codeBien} » est déjà référencé par un autre contrat de ce classeur (un seul contrat actif par bien).` });
      }
      biensReferences.set(donnees.codeBien, ligneExcel);

      if (!bienDansClasseur) {
        const contratActifExistant = await prisma.contrat.findFirst({
          where: { bien: { code: donnees.codeBien }, statut: "actif" },
        });
        if (contratActifExistant) {
          erreurs.push({ feuille: "Contrats", ligne: ligneExcel, message: `Le bien « ${donnees.codeBien} » a déjà un contrat actif dans l'application.` });
        }
      }
    }

    const locataireExistant =
      codesLocatairesVus.has(donnees.codeLocataire) ||
      (await prisma.locataire.findUnique({ where: { code: donnees.codeLocataire } })) !== null;
    if (!locataireExistant) {
      erreurs.push({ feuille: "Contrats", ligne: ligneExcel, message: `Locataire introuvable pour le code « ${donnees.codeLocataire} » (feuille Locataires ou base existante).` });
    }
  }

  return { erreurs, biens: biensValides, locataires: locatairesValides, contrats: contratsValides };
}
