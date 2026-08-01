import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, requirePermission } from "@/lib/api";
import { enregistrerAudit } from "@/lib/audit";
import { genererNumeroContrat } from "@/lib/codes";
import { notifierStaff } from "@/lib/notifications/interne";
import { contratCreationSchema } from "@/lib/validations/contrat";

const INCLUSION = { bien: true, locataire: true, caution: true } as const;

// GET /api/contrats — section 13.4 (rapports contrats), tous profils en lecture.
export async function GET() {
  try {
    await requirePermission("contrats", "lire");

    const contrats = await prisma.contrat.findMany({
      include: INCLUSION,
      orderBy: { numero: "desc" },
    });

    return NextResponse.json({ contrats });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}

// POST /api/contrats — Gérant, Administrateur (RG-C01, RG-C05 ; création
// retirée au Gestionnaire locatif par D-043). Statut initial
// "brouillon" : en attente de validation par le gérant (UC-03).
export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission("contrats", "creer");
    const donnees = contratCreationSchema.parse(await request.json());

    const bien = await prisma.bien.findUnique({ where: { id: donnees.bienId } });
    if (!bien) throw new ApiError(400, "Bien introuvable.");
    if (bien.statut !== "libre") {
      throw new ApiError(409, "Ce bien n'est pas disponible (statut différent de « libre »).");
    }

    const locataire = await prisma.locataire.findUnique({ where: { id: donnees.locataireId } });
    if (!locataire) throw new ApiError(400, "Locataire introuvable.");
    if (locataire.statut !== "actif") {
      throw new ApiError(400, "Ce locataire est archivé.");
    }

    const numero = await genererNumeroContrat();
    const montantCaution = donnees.montantCaution ?? donnees.montantLoyer * 2; // D-016

    const contrat = await prisma.contrat.create({
      data: {
        numero,
        bienId: donnees.bienId,
        locataireId: donnees.locataireId,
        dateDebut: donnees.dateDebut,
        dateFin: donnees.dateFin,
        montantLoyer: donnees.montantLoyer,
        charges: donnees.charges,
        montantCaution,
        avanceLoyer: donnees.avanceLoyer,
        periodicite: donnees.periodicite,
        statut: "brouillon",
        caution: {
          create: {
            montantInitial: montantCaution,
            dateVersement: donnees.dateVersementCaution,
            statut: "detenue",
          },
        },
      },
      include: INCLUSION,
    });

    await enregistrerAudit({
      utilisateurId: session.user.id,
      action: "creation_contrat",
      entiteType: "contrat",
      entiteId: contrat.id,
      nouvelleValeur: contrat,
    });

    // RG-N01, RG-N02 : le gérant doit être notifié des contrats en attente de validation.
    await notifierStaff({
      profils: ["gerant"],
      type: "action_requise",
      titre: `Contrat ${contrat.numero} en attente de validation`,
      message: `Le contrat ${contrat.numero} (${contrat.bien.designation}) a été créé et attend votre validation.`,
    });

    return NextResponse.json({ contrat }, { status: 201 });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
