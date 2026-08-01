import { NextResponse } from "next/server";
import { handleApiError, requirePermission } from "@/lib/api";
import { genererModeleImport } from "@/lib/import/modele";

// GET /api/import/modele — EF-32, D-011. Classeur modèle téléchargeable
// (Administrateur uniquement, cf. matrice §14.1 modifiée par D-041).
export async function GET() {
  try {
    await requirePermission("import", "lire");

    const buffer = await genererModeleImport();

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="modele-import-cimec.xlsx"`,
      },
    });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
