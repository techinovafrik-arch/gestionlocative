import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import { balanceImpayes, syntheseLoyers } from "@/lib/rapports/synthese";
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

// CDC §16.8 : rapports financiers de synthèse.
export default async function PageRapportsSynthese() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "rapports", "lire")) redirect("/");

  const [loyers, balances] = await Promise.all([syntheseLoyers(), balanceImpayes()]);

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-slate-900">Rapports financiers de synthèse</h1>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase text-slate-500">
            Loyers attendus / encaissés — prévision, réalisation, écart
          </h2>
          <BoutonExportExcel type="loyers-synthese" />
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-2">Période</th>
                <th className="px-4 py-2">Prévision (FCFA)</th>
                <th className="px-4 py-2">Réalisation (FCFA)</th>
                <th className="px-4 py-2">Écart (FCFA)</th>
              </tr>
            </thead>
            <tbody>
              {loyers.map((ligne) => (
                <tr key={ligne.periode} className="border-t border-slate-100">
                  <td className="px-4 py-2">{ligne.periode}</td>
                  <td className="px-4 py-2">{ligne.prevision.toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-2">{ligne.realisation.toLocaleString("fr-FR")}</td>
                  <td className={`px-4 py-2 ${ligne.ecart < 0 ? "text-red-600" : "text-emerald-600"}`}>
                    {ligne.ecart.toLocaleString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase text-slate-500">
            Balance des impayés ({balances.length})
          </h2>
          <BoutonExportExcel type="balance-impayes" />
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-2">Locataire</th>
                <th className="px-4 py-2">Montant dû (FCFA)</th>
                <th className="px-4 py-2">Retard (jours)</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((balance) => (
                <tr key={balance.locataire.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">{nomLocataire(balance.locataire)}</td>
                  <td className="px-4 py-2">{balance.montantDu.toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-2">{balance.joursRetard}</td>
                </tr>
              ))}
              {balances.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                    Aucun impayé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
