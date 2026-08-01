import ExcelJS from "exceljs";

export type ColonneExcel = { entete: string; cle: string; largeur?: number };
export type FeuilleExcel = {
  nom: string;
  colonnes: ColonneExcel[];
  lignes: Record<string, unknown>[];
};

// RG-X02 : rapports exportables en Excel.
export async function genererClasseurExcel(feuilles: FeuilleExcel[]): Promise<Buffer> {
  const classeur = new ExcelJS.Workbook();
  classeur.creator = "CIMEC — Gestion locative";
  classeur.created = new Date();

  for (const feuille of feuilles) {
    const worksheet = classeur.addWorksheet(feuille.nom.slice(0, 31)); // limite Excel : 31 caractères
    worksheet.columns = feuille.colonnes.map((colonne) => ({
      header: colonne.entete,
      key: colonne.cle,
      width: colonne.largeur ?? 22,
    }));
    worksheet.getRow(1).font = { bold: true };
    for (const ligne of feuille.lignes) {
      worksheet.addRow(ligne);
    }
  }

  const buffer = await classeur.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
