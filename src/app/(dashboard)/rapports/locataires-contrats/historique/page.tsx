import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { historiqueLocataire } from "@/lib/rapports/locatairesContrats";
import { BoutonExportExcel } from "@/components/rapports/bouton-export-excel";

// CDC §16.4 : historique d'un locataire (logements, contrats, paiements).
export default async function PageHistoriqueLocataire({
  searchParams,
}: {
  searchParams: Promise<{ locataireId?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "rapports", "lire")) redirect("/");

  const { locataireId } = await searchParams;
  const locataires = await prisma.locataire.findMany({ orderBy: { code: "asc" } });
  const historique = locataireId ? await historiqueLocataire(locataireId) : null;

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Historique d&apos;un locataire</h1>

      <form method="get" className="mb-6 flex items-end gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Locataire</label>
          <select
            name="locataireId"
            defaultValue={locataireId ?? ""}
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Sélectionner un locataire
            </option>
            {locataires.map((locataire) => (
              <option key={locataire.id} value={locataire.id}>
                {locataire.code} —{" "}
                {locataire.type === "physique"
                  ? `${locataire.nom} ${locataire.prenoms}`
                  : locataire.raisonSociale}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Afficher
        </button>
      </form>

      {historique && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <BoutonExportExcel type="historique-locataire" parametres={{ locataireId: locataireId! }} />
          </div>
          {historique.contrats.map((contrat) => (
            <div key={contrat.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-900">
                  {contrat.numero} — {contrat.bien.designation} ({contrat.bien.code})
                </p>
                <span className="text-xs capitalize text-slate-500">{contrat.statut}</span>
              </div>
              <p className="mb-3 text-xs text-slate-500">
                Du {contrat.dateDebut.toLocaleDateString("fr-FR")} au{" "}
                {contrat.dateFin.toLocaleDateString("fr-FR")}
              </p>
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-1">Facture</th>
                    <th className="py-1">Période</th>
                    <th className="py-1">Total (FCFA)</th>
                    <th className="py-1">Paiements</th>
                  </tr>
                </thead>
                <tbody>
                  {contrat.factures.map((facture) => (
                    <tr key={facture.id} className="border-t border-slate-100">
                      <td className="py-1">{facture.numero}</td>
                      <td className="py-1">{facture.periode}</td>
                      <td className="py-1">{Number(facture.totalAPayer).toLocaleString("fr-FR")}</td>
                      <td className="py-1">{facture.paiements.length}</td>
                    </tr>
                  ))}
                  {contrat.factures.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-2 text-center text-slate-400">
                        Aucune facture
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}

          {historique.contrats.length === 0 && (
            <p className="text-sm text-slate-500">Aucun contrat pour ce locataire.</p>
          )}
        </div>
      )}
    </div>
  );
}
