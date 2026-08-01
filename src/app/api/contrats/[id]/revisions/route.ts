import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, requirePermission } from "@/lib/api";
import { enregistrerAudit } from "@/lib/audit";
import { revisionLoyerCreationSchema } from "@/lib/validations/contrat";

type Contexte = { params: Promise<{ id: string }> };

// POST /api/contrats/[id]/revisions — proposition de révision de loyer
// (Gestionnaire ou Gérant), validation requise ensuite (RG-C07).
export async function POST(request: NextRequest, { params }: Contexte) {
  try {
    const session = await requirePermission("revisionsLoyer.proposition", "creer");
    const { id } = await params;
    const donnees = revisionLoyerCreationSchema.parse(await request.json());

    const contrat = await prisma.contrat.findUnique({ where: { id } });
    if (!contrat) throw new ApiError(404, "Contrat introuvable.");
    if (contrat.statut !== "actif") {
      throw new ApiError(400, "Seul un contrat actif peut faire l'objet d'une révision de loyer.");
    }

    const revision = await prisma.revisionLoyer.create({
      data: {
        contratId: id,
        ancienMontant: contrat.montantLoyer,
        nouveauMontant: donnees.nouveauMontant,
        dateModification: new Date(),
        motif: donnees.motif,
        demandeParId: session.user.id,
      },
    });

    await enregistrerAudit({
      utilisateurId: session.user.id,
      action: "proposition_revision_loyer",
      entiteType: "revision_loyer",
      entiteId: revision.id,
      nouvelleValeur: revision,
    });

    return NextResponse.json({ revision }, { status: 201 });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
