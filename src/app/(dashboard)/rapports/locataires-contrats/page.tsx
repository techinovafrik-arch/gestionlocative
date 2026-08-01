import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import { contratsAEcheance, locatairesActifs } from "@/lib/rapports/locatairesContrats";
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

const FENETRES = [30, 60, 90] as const;

// CDC §16.4, §16.5 : rapports locataires et contrats.
export default async function PageRapportsLocatairesContrats({
  searchParams,
}: {
  searchParams: Promise<{ jours?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "rapports", "lire")) redirect("/");

  const { jours: joursParam } = await searchParams;
  const jours = FENETRES.includes(Number(joursParam) as (typeof FENETRES)[number])
    ? (Number(joursParam) as (typeof FENETRES)[number])
    : 30;

  const [locataires, contrats] = await Promise.all([locatairesActifs(), contratsAEcheance(jours)]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Rapports locataires et contrats</h1>
        <Link href="/rapports/locataires-contrats/historique" className="text-sm text-blue-700 hover:underline">
          Historique d&apos;un locataire →
        </Link>
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase text-slate-500">
            Locataires actifs ({locataires.length})
          </h2>
          <BoutonExportExcel type="locataires-actifs" />
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-2">Code</th>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Bien occupé</th>
              </tr>
            </thead>
            <tbody>
              {locataires.map((locataire) => (
                <tr key={locataire.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">{locataire.code}</td>
                  <td className="px-4 py-2">{nomLocataire(locataire)}</td>
                  <td className="px-4 py-2">{locataire.telephonePrincipal}</td>
                  <td className="px-4 py-2">{locataire.contrats[0]?.bien.code ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase text-slate-500">
            Contrats arrivant à échéance ({contrats.length})
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {FENETRES.map((f) => (
                <Link
                  key={f}
                  href={`/rapports/locataires-contrats?jours=${f}`}
                  className={`rounded-md px-2 py-1 text-xs ${
                    f === jours ? "bg-blue-700 text-white" : "border border-slate-300 text-slate-600"
                  }`}
                >
                  {f}j
                </Link>
              ))}
            </div>
            <BoutonExportExcel type="contrats-echeance" parametres={{ jours: String(jours) }} />
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-2">Contrat</th>
                <th className="px-4 py-2">Locataire</th>
                <th className="px-4 py-2">Bien</th>
                <th className="px-4 py-2">Date expiration</th>
              </tr>
            </thead>
            <tbody>
              {contrats.map((contrat) => (
                <tr key={contrat.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">{contrat.numero}</td>
                  <td className="px-4 py-2">{nomLocataire(contrat.locataire)}</td>
                  <td className="px-4 py-2">{contrat.bien.code}</td>
                  <td className="px-4 py-2">{contrat.dateFin.toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
              {contrats.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    Aucun contrat à échéance sous {jours} jours.
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
