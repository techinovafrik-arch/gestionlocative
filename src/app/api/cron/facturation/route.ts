import { NextRequest, NextResponse } from "next/server";
import { genererFacturesDuCycle } from "@/lib/facturation";
import { enregistrerAudit, obtenirUtilisateurSysteme } from "@/lib/audit";

// POST /api/cron/facturation — RG-F01, RG-N03. Protégé par CRON_SECRET ; à
// brancher sur un planificateur externe une fois le VPS provisionné
// (technique/00-cadrage-technique.md §6, point 4). L'envoi des notifications
// associées (RG-N03 : « ... → notification ») est du ressort du Sprint 6.
export async function POST(request: NextRequest) {
  const secretAttendu = process.env.CRON_SECRET;
  const secretRecu = request.headers.get("x-cron-secret");
  if (!secretAttendu || secretRecu !== secretAttendu) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const factures = await genererFacturesDuCycle();

  if (factures.length > 0) {
    const utilisateurSysteme = await obtenirUtilisateurSysteme();
    for (const facture of factures) {
      await enregistrerAudit({
        utilisateurId: utilisateurSysteme.id,
        action: "generation_facture",
        entiteType: "facture",
        entiteId: facture.id,
        nouvelleValeur: facture,
      });
    }
  }

  return NextResponse.json({
    total: factures.length,
    numeros: factures.map((f) => f.numero),
  });
}
