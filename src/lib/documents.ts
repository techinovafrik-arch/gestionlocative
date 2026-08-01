import { prisma } from "@/lib/prisma";
import type { EntiteDocument } from "@/generated/prisma";

export class ErreurDocument extends Error {
  code: "ENTITE_INTROUVABLE";

  constructor(message: string) {
    super(message);
    this.code = "ENTITE_INTROUVABLE";
  }
}

// RG-D02 : l'entité cible (bien, locataire, contrat, facture) doit exister —
// l'association polymorphe n'est pas contrainte par une FK au niveau base.
async function entiteExiste(entiteType: EntiteDocument, entiteId: string): Promise<boolean> {
  switch (entiteType) {
    case "bien":
      return (await prisma.bien.findUnique({ where: { id: entiteId } })) !== null;
    case "locataire":
      return (await prisma.locataire.findUnique({ where: { id: entiteId } })) !== null;
    case "contrat":
      return (await prisma.contrat.findUnique({ where: { id: entiteId } })) !== null;
    case "facture":
      return (await prisma.facture.findUnique({ where: { id: entiteId } })) !== null;
  }
}

// RG-D01 : rattachement d'une référence documentaire (le fichier reste sur
// Google Drive, seuls référence/type/lien sécurisé sont conservés).
export async function rattacherDocument(params: {
  typeDocument: string;
  reference: string;
  lienSecurise: string;
  entiteType: EntiteDocument;
  entiteId: string;
  ajouteParId: string;
}) {
  if (!(await entiteExiste(params.entiteType, params.entiteId))) {
    throw new ErreurDocument(`${params.entiteType} introuvable pour l'association demandée.`);
  }

  return prisma.document.create({
    data: {
      typeDocument: params.typeDocument,
      reference: params.reference,
      lienSecurise: params.lienSecurise,
      entiteType: params.entiteType,
      entiteId: params.entiteId,
      ajouteParId: params.ajouteParId,
    },
  });
}
