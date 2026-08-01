import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, requirePermission } from "@/lib/api";
import { enregistrerAudit } from "@/lib/audit";
import { contratClotureSchema } from "@/lib/validations/contrat";

type Contexte = { params: Promise<{ id: string }> };

// POST /api/contrats/[id]/cloturer — Gérant, Administrateur (UC-08, P6 ;
// retiré au Gestionnaire locatif par D-043). Libère le bien ; la décision
// finale sur la caution (remboursement ou retenue) revient au gérant via
// /api/cautions/[id]/valider (RG-K03).
export async function POST(request: NextRequest, { params }: Contexte) {
  try {
    const session = await requirePermission("contrats", "modifier");
    const { id } = await params;
    const donnees = contratClotureSchema.parse(await request.json());

    const contratAvant = await prisma.contrat.findUnique({
      where: { id },
      include: { caution: true },
    });
    if (!contratAvant) throw new ApiError(404, "Contrat introuvable.");
    if (contratAvant.statut !== "actif") {
      throw new ApiError(400, "Seul un contrat actif peut être clôturé.");
    }

    const INCLUSION_CLOTURE = { bien: true, locataire: true, caution: true } as const;
    const proposeRetenue = Boolean(
      contratAvant.caution && (donnees.motifRetenue || donnees.montantRetenuPropose),
    );

    const [, contrat] = proposeRetenue
      ? await prisma.$transaction([
          prisma.bien.update({
            where: { id: contratAvant.bienId },
            data: { statut: "libre" },
          }),
          prisma.caution.update({
            where: { id: contratAvant.caution!.id },
            data: {
              motifRetenue: donnees.motifRetenue,
              montantRetenu: donnees.montantRetenuPropose,
            },
          }),
          prisma.contrat.update({
            where: { id },
            data: { statut: donnees.typeCloture },
            include: INCLUSION_CLOTURE,
          }),
        ]).then(([bien, , contratMisAJour]) => [bien, contratMisAJour] as const)
      : await prisma.$transaction([
          prisma.bien.update({
            where: { id: contratAvant.bienId },
            data: { statut: "libre" },
          }),
          prisma.contrat.update({
            where: { id },
            data: { statut: donnees.typeCloture },
            include: INCLUSION_CLOTURE,
          }),
        ]);

    await enregistrerAudit({
      utilisateurId: session.user.id,
      action: "cloture_contrat",
      entiteType: "contrat",
      entiteId: id,
      ancienneValeur: { statut: contratAvant.statut },
      nouvelleValeur: { statut: contrat.statut },
    });

    return NextResponse.json({ contrat });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
