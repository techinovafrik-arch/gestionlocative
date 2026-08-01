import { z } from "zod";

// RG-C02 (CDC §7.2, §8.4)
export const PERIODICITES = ["mensuelle", "trimestrielle", "annuelle"] as const;

// RG-C01, RG-C02, RG-K01 (caution versée à la signature du contrat).
export const contratCreationSchema = z
  .object({
    bienId: z.string().uuid(),
    locataireId: z.string().uuid(),
    dateDebut: z.coerce.date(),
    dateFin: z.coerce.date(),
    montantLoyer: z.coerce.number().int().positive(),
    charges: z.coerce.number().int().nonnegative().default(0),
    // Absent = 2 mois de loyer par défaut (D-016, RG-K04), calculé côté serveur.
    montantCaution: z.coerce.number().int().nonnegative().optional(),
    avanceLoyer: z.coerce.number().int().nonnegative().default(0),
    periodicite: z.enum(PERIODICITES),
    dateVersementCaution: z.coerce.date(),
  })
  .refine((donnees) => donnees.dateFin > donnees.dateDebut, {
    message: "La date de fin doit être postérieure à la date de début.",
    path: ["dateFin"],
  });

// RG-C07 : proposition de révision de loyer.
export const revisionLoyerCreationSchema = z.object({
  nouveauMontant: z.coerce.number().int().positive(),
  motif: z.string().min(1).max(1000),
});

// UC-08 : clôture d'un contrat, motifs de retenue proposés par le gestionnaire
// (décision finale par le gérant — RG-K02, RG-K03, voir /api/cautions/[id]/valider).
export const contratClotureSchema = z.object({
  typeCloture: z.enum(["resilie", "termine"]),
  motifRetenue: z.string().max(1000).optional(),
  montantRetenuPropose: z.coerce.number().int().nonnegative().optional(),
});

// RG-K02, RG-K03 : décision du gérant sur le sort de la caution.
export const cautionDecisionSchema = z
  .object({
    decision: z.enum(["remboursement_integral", "retenue"]),
    montantRetenu: z.coerce.number().int().nonnegative().optional(),
    motifRetenue: z.string().max(1000).optional(),
  })
  .refine(
    (donnees) => donnees.decision !== "retenue" || donnees.montantRetenu !== undefined,
    { message: "Le montant retenu est requis en cas de retenue.", path: ["montantRetenu"] },
  );

export type ContratCreationInput = z.infer<typeof contratCreationSchema>;
export type RevisionLoyerCreationInput = z.infer<typeof revisionLoyerCreationSchema>;
export type ContratClotureInput = z.infer<typeof contratClotureSchema>;
export type CautionDecisionInput = z.infer<typeof cautionDecisionSchema>;
