import { prisma } from "@/lib/prisma";
import { enregistrerAudit } from "@/lib/audit";
import type { ResultatAnalyse } from "./analyser";
import type { Bien, Locataire, Contrat } from "@/generated/prisma";

export class ErreurImport extends Error {
  code: "CLASSEUR_INVALIDE";
  constructor(message: string) {
    super(message);
    this.code = "CLASSEUR_INVALIDE";
  }
}

export type ResultatImport = { biens: number; locataires: number; contrats: number };

// EF-32, D-011 : exécution transactionnelle de l'import. N'appelle pas
// src/lib/codes.ts : ces générateurs interrogent le client Prisma global (hors
// transaction) et ne verraient donc pas les lignes déjà créées dans ce même
// lot, au risque de générer deux fois le même code — on utilise ici des
// compteurs locaux à la transaction (tx).
export async function executerImport(
  resultat: ResultatAnalyse,
  utilisateurId: string,
): Promise<ResultatImport> {
  if (resultat.erreurs.length > 0) {
    throw new ErreurImport("Le classeur contient des erreurs et ne peut pas être importé.");
  }

  const biensCrees: Bien[] = [];
  const locatairesCrees: Locataire[] = [];
  const contratsCrees: Contrat[] = [];

  await prisma.$transaction(
    async (tx) => {
      let compteurBien = await tx.bien.count();
      let compteurLocataire = await tx.locataire.count();
      let compteurContrat = await tx.contrat.count();

      async function prochainCode(prefixe: string, existe: (code: string) => Promise<boolean>, compteur: number) {
        let valeur = compteur;
        for (let tentative = 0; tentative < 1000; tentative++) {
          valeur += 1;
          const code = `${prefixe}-${String(valeur).padStart(6, "0")}`;
          if (!(await existe(code))) return { code, compteur: valeur };
        }
        throw new Error(`Impossible de générer un code ${prefixe} unique.`);
      }

      // --- Communes / Quartiers (recherche insensible à la casse, création à défaut) ---
      const quartierParNom = new Map<string, string>(); // "commune|quartier" -> quartierId
      async function resoudreQuartier(commune: string, quartier: string): Promise<string> {
        const cle = `${commune.toLowerCase()}|${quartier.toLowerCase()}`;
        const existant = quartierParNom.get(cle);
        if (existant) return existant;

        let communeRow = await tx.commune.findFirst({
          where: { nom: { equals: commune, mode: "insensitive" } },
        });
        if (!communeRow) {
          communeRow = await tx.commune.create({ data: { nom: commune } });
        }

        let quartierRow = await tx.quartier.findFirst({
          where: { communeId: communeRow.id, nom: { equals: quartier, mode: "insensitive" } },
        });
        if (!quartierRow) {
          quartierRow = await tx.quartier.create({ data: { communeId: communeRow.id, nom: quartier } });
        }

        quartierParNom.set(cle, quartierRow.id);
        return quartierRow.id;
      }

      // --- Biens ---
      const bienIdParCode = new Map<string, string>();
      for (const { donnees } of resultat.biens) {
        const quartierId = await resoudreQuartier(donnees.commune, donnees.quartier);

        let code = donnees.code;
        if (!code) {
          const genere = await prochainCode(
            "BIEN",
            (c) => tx.bien.findUnique({ where: { code: c } }).then((r) => r !== null),
            compteurBien,
          );
          code = genere.code;
          compteurBien = genere.compteur;
        }

        const bien = await tx.bien.create({
          data: {
            code,
            type: donnees.type,
            designation: donnees.designation,
            description: donnees.description,
            quartierId,
            adresse: donnees.adresse,
            loyer: donnees.loyer,
            chargesMensuelles: donnees.chargesMensuelles,
            statut: donnees.statut,
          },
        });
        bienIdParCode.set(donnees.code ?? code, bien.id);
        biensCrees.push(bien);
      }

      // --- Locataires ---
      const locataireIdParCode = new Map<string, string>();
      for (const { donnees } of resultat.locataires) {
        let code = donnees.code;
        if (!code) {
          const genere = await prochainCode(
            "LOC",
            (c) => tx.locataire.findUnique({ where: { code: c } }).then((r) => r !== null),
            compteurLocataire,
          );
          code = genere.code;
          compteurLocataire = genere.compteur;
        }

        const estPhysique = donnees.type === "physique";
        const locataire = await tx.locataire.create({
          data: {
            code,
            type: donnees.type,
            civilite: estPhysique ? donnees.civilite : undefined,
            nom: estPhysique ? donnees.nom : undefined,
            prenoms: estPhysique ? donnees.prenoms : undefined,
            dateNaissance: estPhysique ? donnees.dateNaissance : undefined,
            nationalite: estPhysique ? donnees.nationalite : undefined,
            profession: estPhysique ? donnees.profession : undefined,
            raisonSociale: !estPhysique ? donnees.raisonSociale : undefined,
            infosAdministratives: !estPhysique ? donnees.infosAdministratives : undefined,
            representant: !estPhysique ? donnees.representant : undefined,
            telephonePrincipal: donnees.telephonePrincipal,
            telephoneSecondaire: donnees.telephoneSecondaire,
            email: donnees.email,
            piecesIdentite: {
              create: {
                type: donnees.typePieceIdentite,
                numero: donnees.numeroPieceIdentite,
                dateExpiration: donnees.dateExpirationPiece,
              },
            },
          },
        });
        locataireIdParCode.set(donnees.code ?? code, locataire.id);
        locatairesCrees.push(locataire);
      }

      // --- Contrats (statut "actif" directement : reprise de contrats en
      // cours, hors du circuit normal de validation par le gérant — D-041) ---
      for (const { donnees } of resultat.contrats) {
        const bienId =
          bienIdParCode.get(donnees.codeBien) ??
          (await tx.bien.findUnique({ where: { code: donnees.codeBien } }))?.id;
        const locataireId =
          locataireIdParCode.get(donnees.codeLocataire) ??
          (await tx.locataire.findUnique({ where: { code: donnees.codeLocataire } }))?.id;
        if (!bienId || !locataireId) {
          // Ne devrait pas se produire : déjà vérifié par analyserClasseur().
          throw new ErreurImport(`Référence introuvable pour le contrat (bien ${donnees.codeBien} / locataire ${donnees.codeLocataire}).`);
        }

        let numero = donnees.numero;
        if (!numero) {
          const genere = await prochainCode(
            "CTR",
            (c) => tx.contrat.findUnique({ where: { numero: c } }).then((r) => r !== null),
            compteurContrat,
          );
          numero = genere.code;
          compteurContrat = genere.compteur;
        }

        const contrat = await tx.contrat.create({
          data: {
            numero,
            bienId,
            locataireId,
            dateDebut: donnees.dateDebut,
            dateFin: donnees.dateFin,
            montantLoyer: donnees.montantLoyer,
            charges: donnees.charges,
            montantCaution: donnees.montantCaution,
            avanceLoyer: donnees.avanceLoyer,
            periodicite: donnees.periodicite,
            statut: "actif",
            valideParId: utilisateurId,
            dateValidation: new Date(),
            caution: {
              create: {
                montantInitial: donnees.montantCaution,
                dateVersement: donnees.dateVersementCaution,
                statut: "detenue",
              },
            },
          },
        });

        await tx.bien.update({ where: { id: bienId }, data: { statut: "occupe" } });
        contratsCrees.push(contrat);
      }
    },
    { timeout: 60_000 },
  );

  // Journal d'audit (RG-U03) : écrit après commit, à l'image des autres routes
  // (cf. /api/contrats/[id]/valider) — le client Prisma global (hors tx) est
  // utilisé pour l'audit dans tout le projet, jamais dans la transaction elle-même.
  for (const bien of biensCrees) {
    await enregistrerAudit({ utilisateurId, action: "import_bien", entiteType: "bien", entiteId: bien.id, nouvelleValeur: bien });
  }
  for (const locataire of locatairesCrees) {
    await enregistrerAudit({ utilisateurId, action: "import_locataire", entiteType: "locataire", entiteId: locataire.id, nouvelleValeur: locataire });
  }
  for (const contrat of contratsCrees) {
    await enregistrerAudit({ utilisateurId, action: "import_contrat", entiteType: "contrat", entiteId: contrat.id, nouvelleValeur: contrat });
  }

  return { biens: biensCrees.length, locataires: locatairesCrees.length, contrats: contratsCrees.length };
}
