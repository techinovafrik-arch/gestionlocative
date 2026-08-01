import { z } from "zod";

// RG-L01 (CDC §6.1)
export const TYPES_LOCATAIRE = ["physique", "entreprise"] as const;

// RG-L03 (CDC §6.3)
export const TYPES_PIECE_IDENTITE = [
  "passeport",
  "cni",
  "carte_consulaire",
  "permis",
] as const;

const pieceIdentiteSchema = z.object({
  type: z.enum(TYPES_PIECE_IDENTITE),
  numero: z.string().min(1).max(50),
  dateExpiration: z.coerce.date().optional(),
});

// RG-L02 (CDC §6.2)
const identificationSchema = z.object({
  telephonePrincipal: z.string().min(8).max(20),
  telephoneSecondaire: z.string().max(20).optional(),
  email: z.string().email().max(150).optional(),
  contactUrgence: z.string().max(150).optional(),
  pieceIdentite: pieceIdentiteSchema,
});

const locatairePhysiqueSchema = identificationSchema.extend({
  type: z.literal("physique"),
  civilite: z.string().min(1).max(10),
  nom: z.string().min(1).max(100),
  prenoms: z.string().min(1).max(150),
  dateNaissance: z.coerce.date(),
  nationalite: z.string().min(1).max(60),
  profession: z.string().max(100).optional(),
});

const locataireEntrepriseSchema = identificationSchema.extend({
  type: z.literal("entreprise"),
  raisonSociale: z.string().min(1).max(150),
  infosAdministratives: z.string().max(2000).optional(),
  representant: z.string().min(1).max(150),
});

// RG-L01 : personne physique ou entreprise.
export const locataireCreationSchema = z.discriminatedUnion("type", [
  locatairePhysiqueSchema,
  locataireEntrepriseSchema,
]);

// Mise à jour : la pièce d'identité n'est pas re-soumise systématiquement.
export const locataireModificationSchema = z.object({
  civilite: z.string().max(10).optional(),
  nom: z.string().max(100).optional(),
  prenoms: z.string().max(150).optional(),
  dateNaissance: z.coerce.date().optional(),
  nationalite: z.string().max(60).optional(),
  profession: z.string().max(100).optional(),
  raisonSociale: z.string().max(150).optional(),
  infosAdministratives: z.string().max(2000).optional(),
  representant: z.string().max(150).optional(),
  telephonePrincipal: z.string().min(8).max(20).optional(),
  telephoneSecondaire: z.string().max(20).optional(),
  email: z.string().email().max(150).optional(),
  contactUrgence: z.string().max(150).optional(),
});

export type LocataireCreationInput = z.infer<typeof locataireCreationSchema>;
export type LocataireModificationInput = z.infer<typeof locataireModificationSchema>;
