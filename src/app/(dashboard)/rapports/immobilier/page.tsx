import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import { biensDisponibles, biensOccupes, listeBiens } from "@/lib/rapports/immobilier";
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

// CDC §16.3 : rapports immobiliers.
export default async function PageRapportsImmobilier() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "rapports", "lire")) redirect("/");

  const [biens, disponibles, occupes] = await Promise.all([
    listeBiens({}),
    biensDisponibles(),
    biensOccupes(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Rapports immobiliers</h1>
        <Link href="/rapports/immobilier/historique" className="text-sm text-blue-700 hover:underline">
          Historique des occupations par bien →
        </Link>
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Liste des biens ({biens.length})</h2>
          <BoutonExportExcel type="biens" />
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-2">Code</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Localisation</th>
                <th className="px-4 py-2">Loyer (FCFA)</th>
                <th className="px-4 py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {biens.map((bien) => (
                <tr key={bien.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">{bien.code}</td>
                  <td className="px-4 py-2 capitalize">{bien.type.replace("_", " ")}</td>
                  <td className="px-4 py-2">
                    {bien.quartier.nom}, {bien.quartier.commune.nom}
                  </td>
                  <td className="px-4 py-2">{Number(bien.loyer).toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-2 capitalize">{bien.statut.replace("_", " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase text-slate-500">
            Biens disponibles ({disponibles.length})
          </h2>
          <BoutonExportExcel type="biens-disponibles" />
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-2">Code</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Quartier</th>
                <th className="px-4 py-2">Vacance (jours)</th>
              </tr>
            </thead>
            <tbody>
              {disponibles.map((bien) => (
                <tr key={bien.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">{bien.code}</td>
                  <td className="px-4 py-2 capitalize">{bien.type.replace("_", " ")}</td>
                  <td className="px-4 py-2">{bien.quartier.nom}</td>
                  <td className="px-4 py-2">{bien.dureeVacanceJours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Biens occupés ({occupes.length})</h2>
          <BoutonExportExcel type="biens-occupes" />
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-2">Code</th>
                <th className="px-4 py-2">Locataire</th>
                <th className="px-4 py-2">Contrat</th>
                <th className="px-4 py-2">Loyer (FCFA)</th>
                <th className="px-4 py-2">Début occupation</th>
              </tr>
            </thead>
            <tbody>
              {occupes.map((bien) => (
                <tr key={bien.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">{bien.code}</td>
                  <td className="px-4 py-2">{bien.contratActif ? nomLocataire(bien.contratActif.locataire) : "—"}</td>
                  <td className="px-4 py-2">{bien.contratActif?.numero ?? "—"}</td>
                  <td className="px-4 py-2">{Number(bien.loyer).toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-2">
                    {bien.contratActif?.dateDebut.toLocaleDateString("fr-FR") ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
