import { z } from "zod";

// D-042 : génération manuelle ciblée sur un contrat (pas de saisie libre de
// montant/période — ceux-ci restent calculés par src/lib/facturation.ts).
export const factureGenerationSchema = z.object({
  contratId: z.string().uuid(),
});

export type FactureGenerationInput = z.infer<typeof factureGenerationSchema>;
