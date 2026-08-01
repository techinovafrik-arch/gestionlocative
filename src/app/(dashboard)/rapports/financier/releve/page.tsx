import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { relevePaiementsLocataire } from "@/lib/rapports/financier";
import { BoutonExportExcel } from "@/components/rapports/bouton-export-excel";

// CDC §16.6 : relevé des paiements d'un locataire.
export default async function PageReveleLocataire({
  searchParams,
}: {
  searchParams: Promise<{ locataireId?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "rapports", "lire")) redirect("/");

  const { locataireId } = await searchParams;
  const locataires = await prisma.locataire.findMany({ orderBy: { code: "asc" } });
  const paiements = locataireId ? await relevePaiementsLocataire(locataireId) : [];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Relevé des paiements d&apos;un locataire</h1>

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

      {locataireId && (
        <>
          <div className="mb-2 flex justify-end">
            <BoutonExportExcel type="releve-locataire" parametres={{ locataireId }} />
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-2">Référence</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Facture</th>
                  <th className="px-4 py-2">Montant (FCFA)</th>
                  <th className="px-4 py-2">Mode</th>
                </tr>
              </thead>
              <tbody>
                {paiements.map((paiement) => (
                  <tr key={paiement.id} className="border-t border-slate-100">
                    <td className="px-4 py-2">{paiement.reference}</td>
                    <td className="px-4 py-2">{paiement.datePaiement.toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-2">{paiement.facture.numero}</td>
                    <td className="px-4 py-2">{Number(paiement.montant).toLocaleString("fr-FR")}</td>
                    <td className="px-4 py-2">{paiement.mode.replace("_", " ")}</td>
                  </tr>
                ))}
                {paiements.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                      Aucun paiement pour ce locataire.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
