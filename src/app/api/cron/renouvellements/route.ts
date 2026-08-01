import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enregistrerAudit, obtenirUtilisateurSysteme } from "@/lib/audit";
import { genererNumeroContrat } from "@/lib/codes";

// POST /api/cron/renouvellements — RG-C04, CDC §17.7 : tacite reconduction
// des contrats actifs arrivés à échéance. Protégé par CRON_SECRET ; à
// brancher sur un planificateur externe une fois le VPS provisionné
// (technique/00-cadrage-technique.md §6, point 4).
export async function POST(request: NextRequest) {
  const secretAttendu = process.env.CRON_SECRET;
  const secretRecu = request.headers.get("x-cron-secret");
  if (!secretAttendu || secretRecu !== secretAttendu) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const maintenant = new Date();
  const utilisateurSysteme = await obtenirUtilisateurSysteme();

  const contratsEchus = await prisma.contrat.findMany({
    where: { statut: "actif", dateFin: { lte: maintenant } },
    include: { caution: true },
  });

  const renouveles: string[] = [];

  for (const contrat of contratsEchus) {
    const nouvelleDateFin = new Date(contrat.dateFin);
    nouvelleDateFin.setFullYear(nouvelleDateFin.getFullYear() + 1);

    const numero = await genererNumeroContrat();

    await prisma.$transaction([
      prisma.contrat.update({
        where: { id: contrat.id },
        data: { statut: "termine" },
      }),
      prisma.contrat.create({
        data: {
          numero,
          bienId: contrat.bienId,
          locataireId: contrat.locataireId,
          dateDebut: contrat.dateFin,
          dateFin: nouvelleDateFin,
          montantLoyer: contrat.montantLoyer,
          charges: contrat.charges,
          montantCaution: contrat.montantCaution,
          avanceLoyer: contrat.avanceLoyer,
          periodicite: contrat.periodicite,
          statut: "actif",
          valideParId: contrat.valideParId,
          dateValidation: maintenant,
          contratParentId: contrat.id,
          ...(contrat.caution
            ? {
                caution: {
                  create: {
                    montantInitial: contrat.caution.montantInitial,
                    dateVersement: contrat.caution.dateVersement,
                    statut: "detenue",
                  },
                },
              }
            : {}),
        },
      }),
    ]);

    await enregistrerAudit({
      utilisateurId: utilisateurSysteme.id,
      action: "renouvellement_tacite_contrat",
      entiteType: "contrat",
      entiteId: contrat.id,
      ancienneValeur: { statut: "actif", numero: contrat.numero },
      nouvelleValeur: { statut: "termine", nouveauNumero: numero },
    });

    renouveles.push(contrat.numero);
  }

  return NextResponse.json({ renouveles, total: renouveles.length });
}
