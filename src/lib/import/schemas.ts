import { z } from "zod";
import { TYPES_BIEN, STATUTS_BIEN } from "@/lib/validations/bien";
import { TYPES_PIECE_IDENTITE } from "@/lib/validations/locataire";
export { TYPES_LOCATAIRE } from "@/lib/validations/locataire";
import { PERIODICITES } from "@/lib/validations/contrat";

// EF-32, D-011 : reprise des biens, locataires et contrats en cours via un
// classeur Excel à 3 feuilles. Schémas dérivés des schémas de création
// (bien.ts, locataire.ts, contrat.ts) mais assouplis pour de la saisie tabulaire
// (codes optionnels générés à défaut, champs texte trimés/coercés).

const texte = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? undefined : v))
    .optional();

const texteRequis = (max: number, message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .max(max, message);

// Les cellules Excel arrivent soit déjà en Date (cellule formatée date), soit
// en texte JJ/MM/AAAA (format demandé dans les instructions du modèle). Un
// z.coerce.date() nu échouerait sur "15/03/1985" (non conforme à Date()).
// Toute valeur non vide mais non reconnue est renvoyée telle quelle pour que
// z.date() la rejette avec un message explicite plutôt que de l'avaler.
function versDateOuBrut(valeur: unknown): unknown {
  if (valeur === null || valeur === undefined) return undefined;
  if (valeur instanceof Date) return valeur;
  if (typeof valeur !== "string") return valeur;

  const texte = valeur.trim();
  if (texte === "") return undefined;

  const correspondance = texte.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (correspondance) {
    const [, jour, mois, annee] = correspondance;
    const date = new Date(Date.UTC(Number(annee), Number(mois) - 1, Number(jour)));
    if (!Number.isNaN(date.getTime())) return date;
  }

  const iso = new Date(texte);
  if (!Number.isNaN(iso.getTime())) return iso;

  return texte;
}

const dateExcel = (message: string) =>
  z.preprocess(versDateOuBrut, z.date({ message }));

const dateExcelOptionnelle = () =>
  z.preprocess(versDateOuBrut, z.date().optional());

export const ligneBienSchema = z.object({
  code: texte(30),
  type: z.enum(TYPES_BIEN, { message: `Type invalide (attendu : ${TYPES_BIEN.join(", ")}).` }),
  designation: texteRequis(150, "Désignation requise."),
  description: texte(2000),
  commune: texteRequis(100, "Commune requise."),
  quartier: texteRequis(100, "Quartier requis."),
  adresse: texteRequis(255, "Adresse requise."),
  loyer: z.coerce.number({ message: "Loyer invalide." }).int().nonnegative(),
  chargesMensuelles: z.coerce.number().int().nonnegative().optional().default(0),
  statut: z.enum(STATUTS_BIEN).optional().default("libre"),
});

const identiteBaseSchema = z.object({
  code: texte(30),
  telephonePrincipal: texteRequis(20, "Téléphone principal requis."),
  telephoneSecondaire: texte(20),
  email: z
    .string()
    .trim()
    .max(150)
    .transform((v) => (v === "" ? undefined : v))
    .pipe(z.string().email("Email invalide.").optional())
    .optional(),
  typePieceIdentite: z.enum(TYPES_PIECE_IDENTITE, { message: "Type de pièce d'identité invalide." }),
  numeroPieceIdentite: texteRequis(50, "Numéro de pièce d'identité requis."),
  dateExpirationPiece: dateExcelOptionnelle(),
});

export const lignePhysiqueSchema = identiteBaseSchema.extend({
  type: z.literal("physique"),
  civilite: texteRequis(10, "Civilité requise (locataire physique)."),
  nom: texteRequis(100, "Nom requis (locataire physique)."),
  prenoms: texteRequis(150, "Prénoms requis (locataire physique)."),
  dateNaissance: dateExcel("Date de naissance invalide (format attendu JJ/MM/AAAA)."),
  nationalite: texteRequis(60, "Nationalité requise (locataire physique)."),
  profession: texte(100),
});

export const ligneEntrepriseSchema = identiteBaseSchema.extend({
  type: z.literal("entreprise"),
  raisonSociale: texteRequis(150, "Raison sociale requise (locataire entreprise)."),
  representant: texteRequis(150, "Représentant requis (locataire entreprise)."),
  infosAdministratives: texte(2000),
});

export const ligneLocataireSchema = z.discriminatedUnion("type", [
  lignePhysiqueSchema,
  ligneEntrepriseSchema,
]);

export const ligneContratSchema = z
  .object({
    numero: texte(30),
    codeBien: texteRequis(30, "Code bien requis."),
    codeLocataire: texteRequis(30, "Code locataire requis."),
    dateDebut: dateExcel("Date de début invalide (format attendu JJ/MM/AAAA)."),
    dateFin: dateExcel("Date de fin invalide (format attendu JJ/MM/AAAA)."),
    montantLoyer: z.coerce.number({ message: "Loyer mensuel invalide." }).int().positive(),
    charges: z.coerce.number().int().nonnegative().optional().default(0),
    montantCaution: z.coerce.number({ message: "Montant caution invalide." }).int().nonnegative(),
    avanceLoyer: z.coerce.number().int().nonnegative().optional().default(0),
    periodicite: z.enum(PERIODICITES, { message: `Périodicité invalide (attendu : ${PERIODICITES.join(", ")}).` }),
    dateVersementCaution: dateExcel("Date de versement de caution invalide (format attendu JJ/MM/AAAA)."),
  })
  .refine((donnees) => donnees.dateFin > donnees.dateDebut, {
    message: "La date de fin doit être postérieure à la date de début.",
    path: ["dateFin"],
  });

export type LigneBien = z.infer<typeof ligneBienSchema>;
export type LigneLocataire = z.infer<typeof ligneLocataireSchema>;
export type LigneContrat = z.infer<typeof ligneContratSchema>;
