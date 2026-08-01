import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, requirePermission } from "@/lib/api";
import { enregistrerAudit } from "@/lib/audit";
import { enregistrerPaiement } from "@/lib/paiements";
import { paiementCreationSchema } from "@/lib/validations/paiement";

const INCLUSION = {
  facture: { include: { contrat: { include: { bien: true, locataire: true } } } },
  encaissePar: { select: { id: true, nom: true } },
  quittance: true,
} as const;

// GET /api/paiements — section 13.4 (journal des encaissements), tous profils.
export async function GET() {
  try {
    await requirePermission("paiements", "lire");

    const paiements = await prisma.paiement.findMany({
      include: INCLUSION,
      orderBy: { datePaiement: "desc" },
    });

    return NextResponse.json({ paiements });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}

// POST /api/paiements — Gérant, Administrateur (RG-P01, RG-P06 ;
// enregistrement retiré au Gestionnaire locatif par D-043). Impute
// automatiquement sur la facture la plus ancienne due du locataire et
// génère la quittance (RG-P05).
export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("paiements", "creer");
    const donnees = paiementCreationSchema.parse(await request.json());

    const resultat = await enregistrerPaiement({
      locataireId: donnees.locataireId,
      montant: donnees.montant,
      mode: donnees.mode,
      datePaiement: donnees.datePaiement,
      encaisseParId: session.user.id,
    });

    await enregistrerAudit({
      utilisateurId: session.user.id,
      action: "enregistrement_paiement",
      entiteType: "paiement",
      entiteId: resultat.paiement.id,
      nouvelleValeur: resultat,
    });

    return NextResponse.json(resultat, { status: 201 });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
