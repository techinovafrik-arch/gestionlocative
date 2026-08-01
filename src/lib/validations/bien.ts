import { z } from "zod";

// RG-B02 (CDC §1.1)
export const TYPES_BIEN = [
  "maison",
  "villa",
  "appartement",
  "studio",
  "chambre",
  "bureau",
  "magasin",
  "entrepot",
  "terrain",
  "immeuble",
  "local_commercial",
] as const;

// RG-B03 (CDC §5.2)
export const STATUTS_BIEN = ["libre", "occupe", "en_travaux"] as const;

// RG-B01, RG-B04 (CDC §5.1, §5.3)
export const bienCreationSchema = z.object({
  code: z.string().min(1).max(30).optional(),
  type: z.enum(TYPES_BIEN),
  designation: z.string().min(1).max(150),
  description: z.string().max(2000).optional(),
  quartierId: z.string().uuid(),
  adresse: z.string().min(1).max(255),
  loyer: z.coerce.number().int().nonnegative(),
  chargesMensuelles: z.coerce.number().int().nonnegative().default(0),
});

export const bienModificationSchema = bienCreationSchema.partial();

export const bienStatutSchema = z.object({
  statut: z.enum(STATUTS_BIEN),
});

export const bienFiltresSchema = z.object({
  type: z.enum(TYPES_BIEN).optional(),
  statut: z.enum(STATUTS_BIEN).optional(),
  quartierId: z.string().uuid().optional(),
});

export type BienCreationInput = z.infer<typeof bienCreationSchema>;
export type BienModificationInput = z.infer<typeof bienModificationSchema>;
