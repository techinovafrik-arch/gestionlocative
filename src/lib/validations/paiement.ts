import { z } from "zod";

// RG-P02 (CDC §9.3)
export const MODES_PAIEMENT = [
  "especes",
  "virement",
  "cheque",
  "orange_money",
  "mtn_money",
  "moov_money",
  "wave",
] as const;

// RG-P01, RG-P06 : le locataire est sélectionné, le système impute sur la
// facture la plus ancienne due (pas de choix manuel de la facture).
export const paiementCreationSchema = z.object({
  locataireId: z.string().uuid(),
  montant: z.coerce.number().int().positive(),
  mode: z.enum(MODES_PAIEMENT),
  datePaiement: z.coerce.date(),
});

// RG-P04 : correction d'un paiement, validation du gérant.
export const paiementCorrectionSchema = z.object({
  nouveauMontant: z.coerce.number().int().positive().optional(),
  nouveauMode: z.enum(MODES_PAIEMENT).optional(),
  motif: z.string().min(1).max(1000),
});

export type PaiementCreationInput = z.infer<typeof paiementCreationSchema>;
export type PaiementCorrectionInput = z.infer<typeof paiementCorrectionSchema>;
