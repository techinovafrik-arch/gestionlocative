import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import {
  facturesEmises,
  facturesImpayees,
  facturesPartiellementPayees,
  journalEncaissements,
} from "@/lib/rapports/financier";
import { BoutonExportExcel } from "@/components/rapports/bouton-export-excel";

function nomLocataire(locataire: {
  type: string;
  civilite: string | null;
  nom: string | null;
  prenoms: string | null;
  raisonSociale: string | null;
}) {
  return locataire.type === "physique"
    ? [locataire.civilite, locataire.nom, locataire.prenoms].filter(Boolean).join(" ")
    : locataire.raisonSociale;
}

// CDC §16.6 : rapports financiers.
export default async function PageRapportsFinancier() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "rapports", "lire")) redirect("/");

  const [emises, impayees, partielles, encaissements] = await Promise.all([
    facturesEmises(),
    facturesImpayees(),
    facturesPartiellementPayees(),
    journalEncaissements(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Rapports financiers</h1>
        <Link href="/rapports/financier/releve" className="text-sm text-blue-700 hover:underline">
          Relevé des paiements d&apos;un locataire →
        </Link>
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase text-slate-500">
            Factures impayées ({impayees.length})
          </h2>
          <BoutonExportExcel type="factures-impayees" />
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-2">Numéro</th>
                <th className="px-4 py-2">Locataire</th>
                <th className="px-4 py-2">Bien</th>
                <th className="px-4 py-2">Solde dû (FCFA)</th>
                <th className="px-4 py-2">Retard (jours)</th>
              </tr>
            </thead>
            <tbody>
              {impayees.map((facture) => (
                <tr key={facture.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">{facture.numero}</td>
                  <td className="px-4 py-2">{nomLocataire(facture.contrat.locataire)}</td>
                  <td className="px-4 py-2">{facture.contrat.bien.code}</td>
                  <td className="px-4 py-2">{Number(facture.soldeRestant).toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-2">{facture.joursRetard}</td>
                </tr>
              ))}
              {impayees.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-slate-500">
                    Aucune facture impayée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase text-slate-500">
            Factures partiellement payées ({partielles.length})
          </h2>
          <BoutonExportExcel type="factures-partielles" />
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-2">Numéro</th>
                <th className="px-4 py-2">Locataire</th>
                <th className="px-4 py-2">Total (FCFA)</th>
                <th className="px-4 py-2">Payé (FCFA)</th>
                <th className="px-4 py-2">Solde (FCFA)</th>
              </tr>
            </thead>
            <tbody>
              {partielles.map((facture) => (
                <tr key={facture.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">{facture.numero}</td>
                  <td className="px-4 py-2">{nomLocataire(facture.contrat.locataire)}</td>
                  <td className="px-4 py-2">{Number(facture.totalAPayer).toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-2">{Number(facture.montantPaye).toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-2">{Number(facture.soldeRestant).toLocaleString("fr-FR")}</td>
                </tr>
              ))}
              {partielles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-slate-500">
                    Aucune facture partiellement payée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Factures émises ({emises.length})</h2>
          <BoutonExportExcel type="factures-emises" />
        </div>
        <div className="max-h-96 overflow-y-auto overflow-x-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-100 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-2">Numéro</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Locataire</th>
                <th className="px-4 py-2">Total (FCFA)</th>
                <th className="px-4 py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {emises.map((facture) => (
                <tr key={facture.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">{facture.numero}</td>
                  <td className="px-4 py-2">{facture.dateEmission.toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-2">{nomLocataire(facture.contrat.locataire)}</td>
                  <td className="px-4 py-2">{Number(facture.totalAPayer).toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-2 capitalize">{facture.statut.replace("_", " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase text-slate-500">
            Journal des encaissements ({encaissements.length})
          </h2>
          <BoutonExportExcel type="journal-encaissements" />
        </div>
        <div className="max-h-96 overflow-y-auto overflow-x-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-100 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-2">Référence</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Locataire</th>
                <th className="px-4 py-2">Montant (FCFA)</th>
                <th className="px-4 py-2">Mode</th>
                <th className="px-4 py-2">Agent</th>
              </tr>
            </thead>
            <tbody>
              {encaissements.map((paiement) => (
                <tr key={paiement.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">{paiement.reference}</td>
                  <td className="px-4 py-2">{paiement.datePaiement.toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-2">{nomLocataire(paiement.facture.contrat.locataire)}</td>
                  <td className="px-4 py-2">{Number(paiement.montant).toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-2">{paiement.mode.replace("_", " ")}</td>
                  <td className="px-4 py-2">{paiement.encaissePar.nom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
