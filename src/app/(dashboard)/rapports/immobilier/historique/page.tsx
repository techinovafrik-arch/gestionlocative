import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { historiqueOccupations } from "@/lib/rapports/immobilier";
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

// CDC §16.3 : historique des occupations d'un bien.
export default async function PageHistoriqueOccupations({
  searchParams,
}: {
  searchParams: Promise<{ bienId?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "rapports", "lire")) redirect("/");

  const { bienId } = await searchParams;
  const biens = await prisma.bien.findMany({ orderBy: { code: "asc" } });
  const contrats = bienId ? await historiqueOccupations(bienId) : [];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Historique des occupations</h1>

      <form method="get" className="mb-6 flex items-end gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Bien</label>
          <select
            name="bienId"
            defaultValue={bienId ?? ""}
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Sélectionner un bien
            </option>
            {biens.map((bien) => (
              <option key={bien.id} value={bien.id}>
                {bien.code} — {bien.designation}
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

      {bienId && (
        <>
          <div className="mb-2 flex justify-end">
            <BoutonExportExcel type="historique-occupations" parametres={{ bienId }} />
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-2">Contrat</th>
                  <th className="px-4 py-2">Locataire</th>
                  <th className="px-4 py-2">Début</th>
                  <th className="px-4 py-2">Fin</th>
                  <th className="px-4 py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {contrats.map((contrat) => (
                  <tr key={contrat.id} className="border-t border-slate-100">
                    <td className="px-4 py-2">{contrat.numero}</td>
                    <td className="px-4 py-2">{nomLocataire(contrat.locataire)}</td>
                    <td className="px-4 py-2">{contrat.dateDebut.toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-2">{contrat.dateFin.toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-2 capitalize">{contrat.statut}</td>
                  </tr>
                ))}
                {contrats.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                      Aucun contrat pour ce bien.
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
