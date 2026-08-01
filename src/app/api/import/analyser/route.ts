import { NextRequest, NextResponse } from "next/server";
import { ApiError, handleApiError, requirePermission } from "@/lib/api";
import { analyserClasseur } from "@/lib/import/analyser";

// POST /api/import/analyser — EF-32, D-011. Analyse le classeur envoyé
// (validation + contrôles de cohérence) sans rien écrire en base : permet un
// aperçu avant confirmation (Administrateur uniquement, D-041).
export async function POST(request: NextRequest) {
  try {
    await requirePermission("import", "lire");

    const formData = await request.formData();
    const fichier = formData.get("fichier");
    if (!(fichier instanceof File)) {
      throw new ApiError(400, "Fichier requis (champ « fichier »).");
    }

    const buffer = Buffer.from(await fichier.arrayBuffer());
    const resultat = await analyserClasseur(buffer);

    return NextResponse.json({
      erreurs: resultat.erreurs,
      resume: {
        biens: resultat.biens.length,
        locataires: resultat.locataires.length,
        contrats: resultat.contrats.length,
      },
    });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
