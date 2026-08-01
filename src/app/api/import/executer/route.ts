import { NextRequest, NextResponse } from "next/server";
import { ApiError, handleApiError, requirePermission } from "@/lib/api";
import { analyserClasseur } from "@/lib/import/analyser";
import { executerImport } from "@/lib/import/executer";

// POST /api/import/executer — EF-32, D-011. Ré-analyse puis exécute
// l'import de façon transactionnelle (Administrateur uniquement, D-041).
// Le fichier est ré-envoyé et ré-analysé plutôt que réutiliser un état
// serveur temporaire : plus simple/robuste, coût négligeable pour un fichier
// de reprise borné (~70 biens/locataires selon la volumétrie du CDC §03).
export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("import", "creer");

    const formData = await request.formData();
    const fichier = formData.get("fichier");
    if (!(fichier instanceof File)) {
      throw new ApiError(400, "Fichier requis (champ « fichier »).");
    }

    const buffer = Buffer.from(await fichier.arrayBuffer());
    const resultat = await analyserClasseur(buffer);
    if (resultat.erreurs.length > 0) {
      return NextResponse.json({ erreur: "Le classeur contient encore des erreurs.", erreurs: resultat.erreurs }, { status: 400 });
    }

    const resume = await executerImport(resultat, session.user.id);

    return NextResponse.json({ resume }, { status: 201 });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
