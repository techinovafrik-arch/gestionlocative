import { NextRequest, NextResponse } from "next/server";
import { genererRapportMensuel } from "@/lib/rapportMensuel";

// POST /api/cron/rapport-mensuel — RG-N05. Protégé par CRON_SECRET ; à
// brancher sur un planificateur externe une fois le VPS provisionné
// (technique/00-cadrage-technique.md §6, point 4).
export async function POST(request: NextRequest) {
  const secretAttendu = process.env.CRON_SECRET;
  const secretRecu = request.headers.get("x-cron-secret");
  if (!secretAttendu || secretRecu !== secretAttendu) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const synthese = await genererRapportMensuel();

  return NextResponse.json(synthese);
}
