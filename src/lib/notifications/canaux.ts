// Fournisseurs externes (email, SMS, WhatsApp) — architecture posée au
// Sprint 6, fournisseurs non encore choisis (technique/00-cadrage-technique.md
// §6, points 1 à 3). Chaque fonction vérifie sa configuration et journalise
// l'intention d'envoi sans jamais échouer silencieusement ni prétendre avoir
// envoyé un message qui ne l'a pas été. Brancher le fournisseur retenu ici
// une fois le point ouvert tranché, sans changer la signature.

export type ResultatEnvoi = {
  envoye: boolean;
  raison?: string;
};

function resultatNonConfigure(canal: string, variable: string): ResultatEnvoi {
  const raison = `${canal} non envoyé : variable d'environnement ${variable} absente (fournisseur non choisi).`;
  console.warn(`[notifications] ${raison}`);
  return { envoye: false, raison };
}

export async function envoyerEmail(params: {
  destinataire: string;
  sujet: string;
  corps: string;
}): Promise<ResultatEnvoi> {
  if (!process.env.SMTP_HOST) {
    return resultatNonConfigure("Email", "SMTP_HOST");
  }
  // TODO : brancher le fournisseur email retenu (point ouvert #3).
  console.warn(
    `[notifications] SMTP_HOST configuré mais intégration email non encore implémentée (destinataire=${params.destinataire}, sujet="${params.sujet}").`,
  );
  return { envoye: false, raison: "Intégration email non implémentée." };
}

export async function envoyerSms(params: {
  destinataire: string;
  message: string;
}): Promise<ResultatEnvoi> {
  if (!process.env.SMS_PROVIDER_API_KEY) {
    return resultatNonConfigure("SMS", "SMS_PROVIDER_API_KEY");
  }
  // TODO : brancher le fournisseur SMS retenu (point ouvert #1).
  console.warn(
    `[notifications] SMS_PROVIDER_API_KEY configuré mais intégration SMS non encore implémentée (destinataire=${params.destinataire}).`,
  );
  return { envoye: false, raison: "Intégration SMS non implémentée." };
}

export async function envoyerWhatsapp(params: {
  destinataire: string;
  message: string;
}): Promise<ResultatEnvoi> {
  if (!process.env.WHATSAPP_API_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    return resultatNonConfigure("WhatsApp", "WHATSAPP_API_TOKEN / WHATSAPP_PHONE_NUMBER_ID");
  }
  // TODO : brancher l'API WhatsApp Business retenue (point ouvert #2, D-027).
  console.warn(
    `[notifications] Identifiants WhatsApp configurés mais intégration non encore implémentée (destinataire=${params.destinataire}).`,
  );
  return { envoye: false, raison: "Intégration WhatsApp non implémentée." };
}
