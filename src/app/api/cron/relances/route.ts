import { NextRequest, NextResponse } from "next/server";
import { envoyerRelancesDuCycle } from "@/lib/relances";

// POST /api/cron/relances — RG-N04, P4 (section 08). Protégé par CRON_SECRET ;
// à brancher sur un planificateur externe une fois le VPS provisionné
// (technique/00-cadrage-technique.md §6, point 4). Les canaux SMS/WhatsApp/
// email sont en stub tant que les fournisseurs ne sont pas choisis (points 1-3).
export async function POST(request: NextRequest) {
  const secretAttendu = process.env.CRON_SECRET;
  const secretRecu = request.headers.get("x-cron-secret");
  if (!secretAttendu || secretRecu !== secretAttendu) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const resultat = await envoyerRelancesDuCycle();

  return NextResponse.json(resultat);
}
