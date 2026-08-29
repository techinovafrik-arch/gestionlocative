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
});

// Reçu de versement de la caution à la signature du contrat (RG-K01, RG-K04).
// Document non défini par le CDC — portée limitée au versement initial ;
// le remboursement/la retenue restent tracés dans le suivi des cautions
// (écran /cautions, rapport « État des cautions », CDC §16.7).
type CautionPourRecu = {
  montantInitial: Prisma.Decimal;
  dateVersement: Date;
  contrat: {
    numero: string;
    bien: { code: string; designation: string };
    locataire: {
      type: "physique" | "entreprise";
      civilite: string | null;
      nom: string | null;
      prenoms: string | null;
      raisonSociale: string | null;
    };
  };
};

export function RecuCautionPdfDocument({ caution }: { caution: CautionPourRecu }) {
  const { locataire } = caution.contrat;
  const nomLocataire =
    locataire.type === "physique"
      ? [locataire.civilite, locataire.nom, locataire.prenoms].filter(Boolean).join(" ")
      : locataire.raisonSociale;

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

        <Text style={styles.titreCentre}>REÇU DE CAUTION</Text>

        <View style={styles.section}>
          <Text>
            <Text style={styles.label}>Date de versement : </Text>
            {formaterDate(caution.dateVersement)}
          </Text>
          <Text>
            <Text style={styles.label}>Locataire : </Text>
            {nomLocataire}
          </Text>
          <Text>
            <Text style={styles.label}>Bien : </Text>
            {caution.contrat.bien.designation} ({caution.contrat.bien.code})
          </Text>
          <Text>
            <Text style={styles.label}>Contrat : </Text>
            {caution.contrat.numero}
          </Text>
        </View>

        <View style={styles.section}>
          <Text>
            <Text style={styles.label}>Montant de la caution reçu : </Text>
            {formaterFcfa(caution.montantInitial)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text>
            Ce montant sera restitué à la sortie du locataire, déduction faite
            de toute retenue motivée (dégradations, réparations) validée par
            le Gérant.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function genererRecuCautionPdf(caution: CautionPourRecu): Promise<Buffer> {
  return renderToBuffer(<RecuCautionPdfDocument caution={caution} />);
}
