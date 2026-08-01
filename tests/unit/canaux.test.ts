import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { envoyerEmail, envoyerSms, envoyerWhatsapp } from "@/lib/notifications/canaux";

const ENV_ORIGINAL = { ...process.env };

beforeEach(() => {
  delete process.env.SMTP_HOST;
  delete process.env.SMS_PROVIDER_API_KEY;
  delete process.env.WHATSAPP_API_TOKEN;
  delete process.env.WHATSAPP_PHONE_NUMBER_ID;
});

afterEach(() => {
  process.env = { ...ENV_ORIGINAL };
});

// Architecture en stub (Sprint 6) : fournisseurs SMS/WhatsApp/email non
// choisis (technique/00-cadrage-technique.md §6, points 1-3). Ces fonctions
// ne doivent jamais prétendre avoir envoyé un message qui ne l'a pas été.
describe("canaux de notification (stub)", () => {
  it("n'envoie pas d'email si SMTP_HOST est absent", async () => {
    const resultat = await envoyerEmail({
      destinataire: "test@example.com",
      sujet: "Test",
      corps: "Contenu",
    });
    expect(resultat.envoye).toBe(false);
    expect(resultat.raison).toContain("SMTP_HOST");
  });

  it("n'envoie pas de SMS si SMS_PROVIDER_API_KEY est absent", async () => {
    const resultat = await envoyerSms({ destinataire: "0700000000", message: "Test" });
    expect(resultat.envoye).toBe(false);
    expect(resultat.raison).toContain("SMS_PROVIDER_API_KEY");
  });

  it("n'envoie pas de WhatsApp si les identifiants sont absents", async () => {
    const resultat = await envoyerWhatsapp({ destinataire: "0700000000", message: "Test" });
    expect(resultat.envoye).toBe(false);
    expect(resultat.raison).toContain("WHATSAPP");
  });

  it("signale une intégration non implémentée même si le SMTP est configuré", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    const resultat = await envoyerEmail({
      destinataire: "test@example.com",
      sujet: "Test",
      corps: "Contenu",
    });
    expect(resultat.envoye).toBe(false);
    expect(resultat.raison).toContain("non implémentée");
  });
});
