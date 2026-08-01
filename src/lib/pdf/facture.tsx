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
  ligne: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  ligneTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#000000",
    fontFamily: "Helvetica-Bold",
  },
});

// RG-F02, D-034 (pas de mention RCCM/NCC, TVA non appliquée).
type FacturePourPdf = {
  numero: string;
  dateEmission: Date;
  periode: string;
  montantLoyer: Prisma.Decimal;
  charges: Prisma.Decimal;
  arrieres: Prisma.Decimal;
  totalAPayer: Prisma.Decimal;
  montantPaye: Prisma.Decimal;
  soldeRestant: Prisma.Decimal;
  dateEcheance: Date;
  contrat: {
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

export function FacturePdfDocument({ facture }: { facture: FacturePourPdf }) {
  const { locataire } = facture.contrat;
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

        <Text style={styles.titreCentre}>FACTURE N° {facture.numero}</Text>

        <View style={styles.section}>
          <Text>
            <Text style={styles.label}>Date d&apos;émission : </Text>
            {formaterDate(facture.dateEmission)}
          </Text>
          <Text>
            <Text style={styles.label}>Période : </Text>
            {facture.periode}
          </Text>
          <Text>
            <Text style={styles.label}>Échéance : </Text>
            {formaterDate(facture.dateEcheance)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text>
            <Text style={styles.label}>Locataire : </Text>
            {nomLocataire}
          </Text>
          <Text>
            <Text style={styles.label}>Bien : </Text>
            {facture.contrat.bien.designation} ({facture.contrat.bien.code})
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.ligne}>
            <Text>Loyer</Text>
            <Text>{formaterFcfa(facture.montantLoyer)}</Text>
          </View>
          <View style={styles.ligne}>
            <Text>Charges</Text>
            <Text>{formaterFcfa(facture.charges)}</Text>
          </View>
          <View style={styles.ligne}>
            <Text>Arriérés</Text>
            <Text>{formaterFcfa(facture.arrieres)}</Text>
          </View>
          <View style={styles.ligneTotal}>
            <Text>Total à payer</Text>
            <Text>{formaterFcfa(facture.totalAPayer)}</Text>
          </View>
          <View style={styles.ligne}>
            <Text>Montant payé</Text>
            <Text>{formaterFcfa(facture.montantPaye)}</Text>
          </View>
          <View style={styles.ligne}>
            <Text>Solde restant</Text>
            <Text>{formaterFcfa(facture.soldeRestant)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function genererFacturePdf(facture: FacturePourPdf): Promise<Buffer> {
  return renderToBuffer(<FacturePdfDocument facture={facture} />);
}
