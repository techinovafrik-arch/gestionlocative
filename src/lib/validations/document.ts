import { z } from "zod";

// RG-D02 (CDC §12.2)
export const TYPES_ENTITE_DOCUMENT = ["bien", "locataire", "contrat", "facture"] as const;

// RG-D01 (CDC §12.1) : l'application ne conserve que référence, type, lien
// sécurisé, association métier — le fichier lui-même reste sur Google Drive.
export const documentCreationSchema = z.object({
  typeDocument: z.string().min(1).max(50),
  reference: z.string().min(1).max(150),
  lienSecurise: z.string().url().max(500),
  entiteType: z.enum(TYPES_ENTITE_DOCUMENT),
  entiteId: z.string().uuid(),
});

export type DocumentCreationInput = z.infer<typeof documentCreationSchema>;
