import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError, requirePermission } from "@/lib/api";
import { genererClasseurExcel, type FeuilleExcel } from "@/lib/excel";
import * as immobilier from "@/lib/rapports/immobilier";
import * as locatairesContrats from "@/lib/rapports/locatairesContrats";
import * as financier from "@/lib/rapports/financier";
import * as synthese from "@/lib/rapports/synthese";

function nomLocataire(locataire: {
  type: string;
  civilite: string | null;
  nom: string | null;
  prenoms: string | null;
  raisonSociale: string | null;
}): string {
  return locataire.type === "physique"
    ? [locataire.civilite, locataire.nom, locataire.prenoms].filter(Boolean).join(" ")
    : (locataire.raisonSociale ?? "");
}

// GET /api/rapports/excel?type=... — RG-X02. Un onglet par rapport, colonnes
// alignées sur le contenu défini en section 13.4 du dossier de conception.
export async function GET(request: NextRequest) {
  try {
    await requirePermission("rapports", "lire");
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    let feuilles: FeuilleExcel[];

    switch (type) {
      case "biens": {
        const biens = await immobilier.listeBiens({});
        feuilles = [
          {
            nom: "Liste des biens",
            colonnes: [
              { entete: "Code", cle: "code" },
              { entete: "Type", cle: "type" },
              { entete: "Désignation", cle: "designation" },
              { entete: "Quartier", cle: "quartier" },
              { entete: "Commune", cle: "commune" },
              { entete: "Loyer (FCFA)", cle: "loyer" },
              { entete: "Charges (FCFA)", cle: "charges" },
              { entete: "Statut", cle: "statut" },
            ],
            lignes: biens.map((b) => ({
              code: b.code,
              type: b.type,
              designation: b.designation,
              quartier: b.quartier.nom,
              commune: b.quartier.commune.nom,
              loyer: Number(b.loyer),
              charges: Number(b.chargesMensuelles),
              statut: b.statut,
            })),
          },
        ];
        break;
      }

      case "biens-disponibles": {
        const biens = await immobilier.biensDisponibles();
        feuilles = [
          {
            nom: "Biens disponibles",
            colonnes: [
              { entete: "Code", cle: "code" },
              { entete: "Type", cle: "type" },
              { entete: "Quartier", cle: "quartier" },
              { entete: "Durée de vacance (jours)", cle: "duree" },
            ],
            lignes: biens.map((b) => ({
              code: b.code,
              type: b.type,
              quartier: b.quartier.nom,
              duree: b.dureeVacanceJours,
            })),
          },
        ];
        break;
      }

      case "biens-occupes": {
        const biens = await immobilier.biensOccupes();
        feuilles = [
          {
            nom: "Biens occupés",
            colonnes: [
              { entete: "Code", cle: "code" },
              { entete: "Locataire", cle: "locataire" },
              { entete: "Contrat", cle: "contrat" },
              { entete: "Loyer (FCFA)", cle: "loyer" },
              { entete: "Début occupation", cle: "debut" },
            ],
            lignes: biens.map((b) => ({
              code: b.code,
              locataire: b.contratActif ? nomLocataire(b.contratActif.locataire) : "",
              contrat: b.contratActif?.numero ?? "",
              loyer: Number(b.loyer),
              debut: b.contratActif?.dateDebut.toLocaleDateString("fr-FR") ?? "",
            })),
          },
        ];
        break;
      }

      case "historique-occupations": {
        const bienId = searchParams.get("bienId");
        if (!bienId) throw new ApiError(400, "Paramètre bienId requis.");
        const contrats = await immobilier.historiqueOccupations(bienId);
        feuilles = [
          {
            nom: "Historique occupations",
            colonnes: [
              { entete: "Contrat", cle: "contrat" },
              { entete: "Locataire", cle: "locataire" },
              { entete: "Date début", cle: "debut" },
              { entete: "Date fin", cle: "fin" },
              { entete: "Statut", cle: "statut" },
            ],
            lignes: contrats.map((c) => ({
              contrat: c.numero,
              locataire: nomLocataire(c.locataire),
              debut: c.dateDebut.toLocaleDateString("fr-FR"),
              fin: c.dateFin.toLocaleDateString("fr-FR"),
              statut: c.statut,
            })),
          },
        ];
        break;
      }

      case "locataires-actifs": {
        const locataires = await locatairesContrats.locatairesActifs();
        feuilles = [
          {
            nom: "Locataires actifs",
            colonnes: [
              { entete: "Code", cle: "code" },
              { entete: "Nom", cle: "nom" },
              { entete: "Téléphone", cle: "telephone" },
              { entete: "Bien occupé", cle: "bien" },
              { entete: "Date contrat", cle: "date" },
            ],
            lignes: locataires.map((l) => ({
              code: l.code,
              nom: nomLocataire(l),
              telephone: l.telephonePrincipal,
              bien: l.contrats[0]?.bien.code ?? "",
              date: l.contrats[0]?.dateDebut.toLocaleDateString("fr-FR") ?? "",
            })),
          },
        ];
        break;
      }

      case "historique-locataire": {
        const locataireId = searchParams.get("locataireId");
        if (!locataireId) throw new ApiError(400, "Paramètre locataireId requis.");
        const historique = await locatairesContrats.historiqueLocataire(locataireId);
        if (!historique) throw new ApiError(404, "Locataire introuvable.");

        const lignes = historique.contrats.flatMap((contrat) =>
          contrat.factures.map((facture) => ({
            contrat: contrat.numero,
            bien: contrat.bien.code,
            statutContrat: contrat.statut,
            facture: facture.numero,
            periode: facture.periode,
            total: Number(facture.totalAPayer),
            nbPaiements: facture.paiements.length,
          })),
        );

        feuilles = [
          {
            nom: "Historique locataire",
            colonnes: [
              { entete: "Contrat", cle: "contrat" },
              { entete: "Bien", cle: "bien" },
              { entete: "Statut contrat", cle: "statutContrat" },
              { entete: "Facture", cle: "facture" },
              { entete: "Période", cle: "periode" },
              { entete: "Total (FCFA)", cle: "total" },
              { entete: "Nb paiements", cle: "nbPaiements" },
            ],
            lignes,
          },
        ];
        break;
      }

      case "contrats-echeance": {
        const jours = Number(searchParams.get("jours") ?? "30");
        const joursValide = [30, 60, 90].includes(jours) ? (jours as 30 | 60 | 90) : 30;
        const contrats = await locatairesContrats.contratsAEcheance(joursValide);
        feuilles = [
          {
            nom: `Échéance ${joursValide}j`,
            colonnes: [
              { entete: "Contrat", cle: "contrat" },
              { entete: "Locataire", cle: "locataire" },
              { entete: "Bien", cle: "bien" },
              { entete: "Date expiration", cle: "expiration" },
            ],
            lignes: contrats.map((c) => ({
              contrat: c.numero,
              locataire: nomLocataire(c.locataire),
              bien: c.bien.code,
              expiration: c.dateFin.toLocaleDateString("fr-FR"),
            })),
          },
        ];
        break;
      }

      case "factures-emises":
      case "factures-impayees":
      case "factures-partielles": {
        const factures =
          type === "factures-emises"
            ? await financier.facturesEmises()
            : type === "factures-impayees"
              ? await financier.facturesImpayees()
              : await financier.facturesPartiellementPayees();

        feuilles = [
          {
            nom: type,
            colonnes: [
              { entete: "Numéro", cle: "numero" },
              { entete: "Date", cle: "date" },
              { entete: "Locataire", cle: "locataire" },
              { entete: "Montant total (FCFA)", cle: "total" },
              { entete: "Solde restant (FCFA)", cle: "solde" },
              { entete: "Statut", cle: "statut" },
            ],
            lignes: factures.map((f) => ({
              numero: f.numero,
              date: f.dateEmission.toLocaleDateString("fr-FR"),
              locataire: nomLocataire(f.contrat.locataire),
              total: Number(f.totalAPayer),
              solde: Number(f.soldeRestant),
              statut: f.statut,
            })),
          },
        ];
        break;
      }

      case "journal-encaissements": {
        const paiements = await financier.journalEncaissements();
        feuilles = [
          {
            nom: "Journal encaissements",
            colonnes: [
              { entete: "Référence", cle: "reference" },
              { entete: "Date", cle: "date" },
              { entete: "Locataire", cle: "locataire" },
              { entete: "Montant (FCFA)", cle: "montant" },
              { entete: "Mode", cle: "mode" },
              { entete: "Agent", cle: "agent" },
            ],
            lignes: paiements.map((p) => ({
              reference: p.reference,
              date: p.datePaiement.toLocaleDateString("fr-FR"),
              locataire: nomLocataire(p.facture.contrat.locataire),
              montant: Number(p.montant),
              mode: p.mode,
              agent: p.encaissePar.nom,
            })),
          },
        ];
        break;
      }

      case "releve-locataire": {
        const locataireId = searchParams.get("locataireId");
        if (!locataireId) throw new ApiError(400, "Paramètre locataireId requis.");
        const paiements = await financier.relevePaiementsLocataire(locataireId);
        feuilles = [
          {
            nom: "Relevé locataire",
            colonnes: [
              { entete: "Référence", cle: "reference" },
              { entete: "Date", cle: "date" },
              { entete: "Facture", cle: "facture" },
              { entete: "Montant (FCFA)", cle: "montant" },
              { entete: "Mode", cle: "mode" },
            ],
            lignes: paiements.map((p) => ({
              reference: p.reference,
              date: p.datePaiement.toLocaleDateString("fr-FR"),
              facture: p.facture.numero,
              montant: Number(p.montant),
              mode: p.mode,
            })),
          },
        ];
        break;
      }

      case "cautions": {
        const cautions = await prisma.caution.findMany({
          include: { contrat: { include: { bien: true, locataire: true } } },
          orderBy: { createdAt: "desc" },
        });
        feuilles = [
          {
            nom: "État des cautions",
            colonnes: [
              { entete: "Contrat", cle: "contrat" },
              { entete: "Locataire", cle: "locataire" },
              { entete: "Bien", cle: "bien" },
              { entete: "Montant initial (FCFA)", cle: "initial" },
              { entete: "Retenu (FCFA)", cle: "retenu" },
              { entete: "Remboursé (FCFA)", cle: "rembourse" },
              { entete: "Statut", cle: "statut" },
            ],
            lignes: cautions.map((c) => ({
              contrat: c.contrat.numero,
              locataire: nomLocataire(c.contrat.locataire),
              bien: c.contrat.bien.code,
              initial: Number(c.montantInitial),
              retenu: Number(c.montantRetenu ?? 0),
              rembourse: c.montantRembourse !== null ? Number(c.montantRembourse) : "",
              statut: c.statut,
            })),
          },
        ];
        break;
      }

      case "loyers-synthese": {
        const lignes = await synthese.syntheseLoyers();
        feuilles = [
          {
            nom: "Synthèse loyers",
            colonnes: [
              { entete: "Période", cle: "periode" },
              { entete: "Prévision (FCFA)", cle: "prevision" },
              { entete: "Réalisation (FCFA)", cle: "realisation" },
              { entete: "Écart (FCFA)", cle: "ecart" },
            ],
            lignes,
          },
        ];
        break;
      }

      case "balance-impayes": {
        const balances = await synthese.balanceImpayes();
        feuilles = [
          {
            nom: "Balance des impayés",
            colonnes: [
              { entete: "Locataire", cle: "locataire" },
              { entete: "Montant dû (FCFA)", cle: "montant" },
              { entete: "Retard (jours)", cle: "retard" },
            ],
            lignes: balances.map((b) => ({
              locataire: nomLocataire(b.locataire),
              montant: b.montantDu,
              retard: b.joursRetard,
            })),
          },
        ];
        break;
      }

      default:
        throw new ApiError(400, "Type de rapport inconnu.");
    }

    const buffer = await genererClasseurExcel(feuilles);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="rapport-${type}.xlsx"`,
      },
    });
  } catch (erreur) {
    return handleApiError(erreur);
  }
}
