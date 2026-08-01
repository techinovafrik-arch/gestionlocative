import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { Prisma } from "@/generated/prisma";
import { AGENCE } from "@/lib/agence";
import { formaterDate, formaterFcfa } from "@/lib/pdf/formatage";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  header: { marginBottom: 20, textAlign: "center" },
  titre: { fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  titreCentre: { fontSize: 14, fontFamily: "Helvetica-Bold", textAlign: "center", marginBottom: 16 },
  section: { marginBottom: 12 },
  label: { fontFamily: "Helvetica-Bold" },
  signatures: { flexDirection: "row", justifyContent: "space-between", marginTop: 60 },
  signatureBloc: {
    width: "40%",
    borderTopWidth: 1,
    borderTopColor: "#000000",
    paddingTop: 4,
    textAlign: "center",
  },
});

// RG-C06, D-035 : deux trames selon le type de locataire.
type ContratPourPdf = {
  numero: string;
  dateDebut: Date;
  dateFin: Date;
  montantLoyer: Prisma.Decimal;
  charges: Prisma.Decimal;
  montantCaution: Prisma.Decimal;
  avanceLoyer: Prisma.Decimal | null;
  periodicite: string;
  bien: { code: string; designation: string; adresse: string };
  locataire: {
    type: "physique" | "entreprise";
    civilite: string | null;
    nom: string | null;
    prenoms: string | null;
    raisonSociale: string | null;
    representant: string | null;
    telephonePrincipal: string;
  };
};

const LIBELLES_PERIODICITE: Record<string, string> = {
  mensuelle: "mensuelle",
  trimestrielle: "trimestrielle",
  annuelle: "annuelle",
};

export function ContratPdfDocument({ contrat }: { contrat: ContratPourPdf }) {
  const estCommercial = contrat.locataire.type === "entreprise";
  const nomLocataire = estCommercial
    ? contrat.locataire.raisonSociale
    : [contrat.locataire.civilite, contrat.locataire.nom, contrat.locataire.prenoms]
        .filter(Boolean)
        .join(" ");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.titre}>{AGENCE.nom}</Text>
          <Text>{AGENCE.adresse}</Text>
          <Text>
            {AGENCE.telephone} — {AGENCE.email}
          </Text>
        </View>

        <Text style={styles.titreCentre}>
          CONTRAT DE BAIL {estCommercial ? "COMMERCIAL" : "D'HABITATION"}
        </Text>

        <View style={styles.section}>
          <Text>
            <Text style={styles.label}>Numéro de contrat : </Text>
            {contrat.numero}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Entre les soussignés :</Text>
          <Text>
            Le Bailleur : {AGENCE.nom}, {AGENCE.adresse}
          </Text>
          <Text>
            Le Locataire : {nomLocataire}
            {estCommercial && contrat.locataire.representant
              ? ` (représenté par ${contrat.locataire.representant})`
              : ""}
            , tél. {contrat.locataire.telephonePrincipal}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Désignation du bien loué :</Text>
          <Text>
            {contrat.bien.designation} ({contrat.bien.code}) — {contrat.bien.adresse}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Conditions financières :</Text>
          <Text>
            Loyer : {formaterFcfa(contrat.montantLoyer)} (
            {LIBELLES_PERIODICITE[contrat.periodicite] ?? contrat.periodicite})
          </Text>
          <Text>Charges : {formaterFcfa(contrat.charges)}</Text>
          <Text>Caution : {formaterFcfa(contrat.montantCaution)}</Text>
          {Number(contrat.avanceLoyer ?? 0) > 0 && (
            <Text>Avance sur loyer : {formaterFcfa(contrat.avanceLoyer)}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Durée :</Text>
          <Text>
            Du {formaterDate(contrat.dateDebut)} au {formaterDate(contrat.dateFin)}, renouvelable
            par tacite reconduction sauf préavis contraire.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Clauses principales :</Text>
          <Text>- Le locataire s&apos;engage à payer le loyer et les charges aux échéances convenues.</Text>
          <Text>- Le locataire s&apos;engage à maintenir le bien en bon état d&apos;entretien.</Text>
          <Text>
            - La caution sera restituée en fin de contrat, déduction faite des sommes dues le cas
            échéant.
          </Text>
          {estCommercial && <Text>- Le bien est destiné à un usage commercial exclusivement.</Text>}
        </View>

        <View style={styles.signatures}>
          <View style={styles.signatureBloc}>
            <Text>Le Bailleur</Text>
          </View>
          <View style={styles.signatureBloc}>
            <Text>Le Locataire</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function genererContratPdf(contrat: ContratPourPdf): Promise<Buffer> {
  return renderToBuffer(<ContratPdfDocument contrat={contrat} />);
}
