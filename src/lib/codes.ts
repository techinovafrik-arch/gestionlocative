import { prisma } from "@/lib/prisma";

// RG-B01 : code bien unique, généré automatiquement (ou saisi manuellement).
export async function genererCodeBien(): Promise<string> {
  for (let tentative = 0; tentative < 5; tentative++) {
    const total = await prisma.bien.count();
    const code = `BIEN-${String(total + 1 + tentative).padStart(6, "0")}`;
    const existe = await prisma.bien.findUnique({ where: { code } });
    if (!existe) return code;
  }
  throw new Error("Impossible de générer un code bien unique.");
}

// RG-L02 : code locataire unique.
export async function genererCodeLocataire(): Promise<string> {
  for (let tentative = 0; tentative < 5; tentative++) {
    const total = await prisma.locataire.count();
    const code = `LOC-${String(total + 1 + tentative).padStart(6, "0")}`;
    const existe = await prisma.locataire.findUnique({ where: { code } });
    if (!existe) return code;
  }
  throw new Error("Impossible de générer un code locataire unique.");
}

// RG-C02 : numéro de contrat unique.
export async function genererNumeroContrat(): Promise<string> {
  for (let tentative = 0; tentative < 5; tentative++) {
    const total = await prisma.contrat.count();
    const numero = `CTR-${String(total + 1 + tentative).padStart(6, "0")}`;
    const existe = await prisma.contrat.findUnique({ where: { numero } });
    if (!existe) return numero;
  }
  throw new Error("Impossible de générer un numéro de contrat unique.");
}

// RG-F02 : numéro de facture unique.
export async function genererNumeroFacture(): Promise<string> {
  for (let tentative = 0; tentative < 5; tentative++) {
    const total = await prisma.facture.count();
    const numero = `FAC-${String(total + 1 + tentative).padStart(6, "0")}`;
    const existe = await prisma.facture.findUnique({ where: { numero } });
    if (!existe) return numero;
  }
  throw new Error("Impossible de générer un numéro de facture unique.");
}

// RG-P03 : référence de paiement unique.
export async function genererReferencePaiement(): Promise<string> {
  for (let tentative = 0; tentative < 5; tentative++) {
    const total = await prisma.paiement.count();
    const reference = `PAI-${String(total + 1 + tentative).padStart(6, "0")}`;
    const existe = await prisma.paiement.findUnique({ where: { reference } });
    if (!existe) return reference;
  }
  throw new Error("Impossible de générer une référence de paiement unique.");
}

// RG-P05 : numéro de quittance unique.
export async function genererNumeroQuittance(): Promise<string> {
  for (let tentative = 0; tentative < 5; tentative++) {
    const total = await prisma.quittance.count();
    const numero = `QUI-${String(total + 1 + tentative).padStart(6, "0")}`;
    const existe = await prisma.quittance.findUnique({ where: { numero } });
    if (!existe) return numero;
  }
  throw new Error("Impossible de générer un numéro de quittance unique.");
}
