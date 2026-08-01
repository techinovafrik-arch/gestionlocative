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

const LIBELLES_MODE: Record<string, string> = {
  especes: "Espèces",
  virement: "Virement bancaire",
  cheque: "Chèque",
  orange_money: "Orange Money",
  mtn_money: "MTN Money",
  moov_money: "Moov Money",
  wave: "Wave",
};

// RG-P05 (CDC §10).
type QuittancePourPdf = {
  numero: string;
  date: Date;
  paiement: {
    montant: Prisma.Decimal;
    mode: string;
    facture: {
      periode: string;
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
  };
};

export function QuittancePdfDocument({ quittance }: { quittance: QuittancePourPdf }) {
  const { locataire } = quittance.paiement.facture.contrat;
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

        <Text style={styles.titreCentre}>QUITTANCE N° {quittance.numero}</Text>

        <View style={styles.section}>
          <Text>
            <Text style={styles.label}>Date : </Text>
            {formaterDate(quittance.date)}
          </Text>
          <Text>
            <Text style={styles.label}>Locataire : </Text>
            {nomLocataire}
          </Text>
          <Text>
            <Text style={styles.label}>Bien : </Text>
            {quittance.paiement.facture.contrat.bien.designation} (
            {quittance.paiement.facture.contrat.bien.code})
          </Text>
          <Text>
            <Text style={styles.label}>Période : </Text>
            {quittance.paiement.facture.periode}
          </Text>
        </View>

        <View style={styles.section}>
          <Text>
            <Text style={styles.label}>Montant payé : </Text>
            {formaterFcfa(quittance.paiement.montant)}
          </Text>
          <Text>
            <Text style={styles.label}>Mode de paiement : </Text>
            {LIBELLES_MODE[quittance.paiement.mode] ?? quittance.paiement.mode}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function genererQuittancePdf(quittance: QuittancePourPdf): Promise<Buffer> {
  return renderToBuffer(<QuittancePdfDocument quittance={quittance} />);
}
