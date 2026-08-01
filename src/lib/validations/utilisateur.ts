import { z } from "zod";

// RG-U01 (CDC §13.1)
export const PROFILS_UTILISATEUR = [
  "administrateur",
  "gerant",
  "gestionnaire",
  "consultation",
] as const;

// D-036 : 8 caractères minimum, majuscule + chiffre exigés.
const motDePasseSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule.")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre.");

export const utilisateurCreationSchema = z.object({
  nom: z.string().min(1).max(150),
  email: z.string().email().max(150),
  motDePasse: motDePasseSchema,
  profil: z.enum(PROFILS_UTILISATEUR),
});

export const utilisateurModificationSchema = z.object({
  nom: z.string().min(1).max(150).optional(),
  profil: z.enum(PROFILS_UTILISATEUR).optional(),
  actif: z.boolean().optional(),
  motDePasse: motDePasseSchema.optional(),
});

export type UtilisateurCreationInput = z.infer<typeof utilisateurCreationSchema>;
export type UtilisateurModificationInput = z.infer<typeof utilisateurModificationSchema>;
