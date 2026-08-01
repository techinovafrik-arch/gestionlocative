import { prisma } from "@/lib/prisma";
import { envoyerEmail, envoyerSms, envoyerWhatsapp } from "@/lib/notifications/canaux";

// RG-N04 : alerte envoyée dans les jours précédant l'échéance du 10.
const JOURS_AVANT_ALERTE_ECHEANCE = 5;

type LocatairePourRelance = {
  type: string;
  civilite: string | null;
  nom: string | null;
  prenoms: string | null;
  raisonSociale: string | null;
  telephonePrincipal: string;
  email: string | null;
};

function nomLocataire(locataire: LocatairePourRelance): string {
  return locataire.type === "physique"
    ? [locataire.civilite, locataire.nom, locataire.prenoms].filter(Boolean).join(" ")
    : (locataire.raisonSociale ?? "");
}

// D-026, D-027 : relance sur les 3 canaux (WhatsApp, SMS, email — intégré dès
// la V1, contrairement au CDC initial qui classait WhatsApp en évolution
// future). Les fournisseurs sont en stub tant que non choisis (voir canaux.ts).
async function envoyerAuLocataire(locataire: LocatairePourRelance, sujet: string, message: string) {
  await envoyerWhatsapp({ destinataire: locataire.telephonePrincipal, message });
  await envoyerSms({ destinataire: locataire.telephonePrincipal, message });
  if (locataire.email) {
    await envoyerEmail({ destinataire: locataire.email, sujet, corps: message });
  }
}

// RG-N04 : alerte échéance avant le 10 du mois. Idempotente
// (alerteEcheanceEnvoyee) pour ne pas relancer plusieurs fois.
export async function envoyerAlertesEcheance(maintenant = new Date()) {
  const dateLimite = new Date(maintenant);
  dateLimite.setDate(dateLimite.getDate() + JOURS_AVANT_ALERTE_ECHEANCE);

  const factures = await prisma.facture.findMany({
    where: {
      statut: { in: ["emise", "partiellement_payee"] },
      alerteEcheanceEnvoyee: false,
      dateEcheance: { gte: maintenant, lte: dateLimite },
    },
    include: { contrat: { include: { locataire: true } } },
  });

  for (const facture of factures) {
    const { locataire } = facture.contrat;
    const message = `Bonjour ${nomLocataire(locataire)}, la facture ${facture.numero} de ${Number(
      facture.soldeRestant,
    ).toLocaleString("fr-FR")} FCFA est due avant le ${facture.dateEcheance.toLocaleDateString("fr-FR")}.`;

    await envoyerAuLocataire(locataire, `Échéance à venir — Facture ${facture.numero}`, message);
    await prisma.facture.update({ where: { id: facture.id }, data: { alerteEcheanceEnvoyee: true } });
  }

  return factures.length;
}

// RG-N04, P4 (section 08) : relance amiable après passage en « impayée ».
// La mise en demeure reste une décision manuelle du gérant, non automatisée
// (D-026 : « à l'appréciation du gérant »). Idempotente (relanceImpayeEnvoyee).
export async function envoyerRelancesImpayes() {
  const factures = await prisma.facture.findMany({
    where: { statut: "impayee", relanceImpayeEnvoyee: false },
    include: { contrat: { include: { locataire: true } } },
  });

  for (const facture of factures) {
    const { locataire } = facture.contrat;
    const message = `Bonjour ${nomLocataire(locataire)}, la facture ${facture.numero} de ${Number(
      facture.soldeRestant,
    ).toLocaleString("fr-FR")} FCFA est impayée depuis le ${facture.dateEcheance.toLocaleDateString("fr-FR")}. Merci de régulariser votre situation dans les meilleurs délais.`;

    await envoyerAuLocataire(locataire, `Facture impayée — ${facture.numero}`, message);
    await prisma.facture.update({ where: { id: facture.id }, data: { relanceImpayeEnvoyee: true } });
  }

  return factures.length;
}

export async function envoyerRelancesDuCycle(maintenant = new Date()) {
  const alertesEcheance = await envoyerAlertesEcheance(maintenant);
  const relancesImpayes = await envoyerRelancesImpayes();
  return { alertesEcheance, relancesImpayes };
}
