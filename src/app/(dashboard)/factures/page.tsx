import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { GenererFacture } from "@/components/factures/generer-facture";
import { SelecteurPage } from "@/components/factures/selecteur-page";
import { listerFacturesNonSoldees, PERIODES_FILTRE, type PeriodeFiltre } from "@/lib/factures";

const LIBELLES_PERIODE_FILTRE: Record<PeriodeFiltre, string> = {
  jour: "Jour",
  mois: "Dernier mois",
  annee: "Année en cours",
  total: "Total",
};

const LIBELLES_STATUT: Record<string, string> = {
  emise: "Émise",
  partiellement_payee: "Partiellement payée",
  payee: "Payée",
  impayee: "Impayée",
};

const COULEURS_STATUT: Record<string, string> = {
  emise: "bg-blue-100 text-blue-800",
  partiellement_payee: "bg-orange-100 text-orange-800",
  payee: "bg-emerald-100 text-emerald-800",
  impayee: "bg-red-100 text-red-800",
};

export default async function PageFactures({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "factures", "lire")) redirect("/");

  const { periode: periodeBrute, page: pageBrute } = await searchParams;
  const periode: PeriodeFiltre = PERIODES_FILTRE.includes(periodeBrute as PeriodeFiltre)
    ? (periodeBrute as PeriodeFiltre)
    : "total";
  const pageDemandee = Number(pageBrute ?? "1") || 1;

  const impayees = await listerFacturesNonSoldees({ periode, page: pageDemandee });

  const factures = await prisma.facture.findMany({
    include: { contrat: { include: { bien: true, locataire: true } } },
    orderBy: { dateEmission: "desc" },
  });

  const peutGenerer = peut(session.user.profil, "factures", "creer");
  const contratsActifs = peutGenerer
    ? await prisma.contrat.findMany({
        where: { statut: "actif" },
        include: { bien: true, locataire: true },
        orderBy: { numero: "asc" },
      })
    : [];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Factures ({factures.length})</h1>

      <section
        id="factures-impayees"
        className="mb-8 rounded-lg border border-slate-200 bg-white p-4"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Factures impayées</h2>
          <div className="flex gap-2">
            {PERIODES_FILTRE.map((p) => (
              <Link
                key={p}
                href={`/factures?periode=${p}#factures-impayees`}
                className={`rounded-md px-3 py-1 text-xs font-medium ${
                  periode === p
                    ? "bg-blue-700 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {LIBELLES_PERIODE_FILTRE[p]}
              </Link>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-2">N° facture</th>
                <th className="px-4 py-2">Période</th>
                <th className="px-4 py-2">Client</th>
                <th className="px-4 py-2">Montant (FCFA)</th>
              </tr>
            </thead>
            <tbody>
              {impayees.factures.map((facture) => {
                const { locataire } = facture.contrat;
                const nomLocataire =
                  locataire.type === "physique"
                    ? `${locataire.nom ?? ""} ${locataire.prenoms ?? ""}`
                    : (locataire.raisonSociale ?? "");

                return (
                  <tr key={facture.id} className="border-t border-slate-100">
                    <td className="px-4 py-2 font-medium">{facture.numero}</td>
                    <td className="px-4 py-2">{facture.periode}</td>
                    <td className="px-4 py-2">{nomLocataire}</td>
                    <td className="px-4 py-2">{Number(facture.soldeRestant).toLocaleString("fr-FR")}</td>
                  </tr>
                );
              })}
              {impayees.factures.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    Aucune facture impayée sur cette période.
                  </td>
                </tr>
              )}
            </tbody>
            {impayees.total > 0 && (
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50 font-medium">
                  <td colSpan={3} className="px-4 py-2 text-right">
                    Total des impayées ({impayees.total} facture{impayees.total > 1 ? "s" : ""}) :
                  </td>
                  <td className="px-4 py-2">
                    {impayees.totalMontantDu.toLocaleString("fr-FR")} FCFA
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {impayees.nombrePages > 1 && (
          <div className="mt-3 flex justify-end">
            <SelecteurPage nombrePages={impayees.nombrePages} pageCourante={impayees.page} />
          </div>
        )}
      </section>

      {peutGenerer && (
        <GenererFacture
          contrats={contratsActifs.map((c) => ({
            id: c.id,
            numero: c.numero,
            bien: c.bien.code,
            locataire:
              c.locataire.type === "physique"
                ? `${c.locataire.nom ?? ""} ${c.locataire.prenoms ?? ""}`
                : (c.locataire.raisonSociale ?? ""),
          }))}
        />
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Numéro</th>
              <th className="px-4 py-3">Période</th>
              <th className="px-4 py-3">Locataire</th>
              <th className="px-4 py-3">Bien</th>
              <th className="px-4 py-3">Total (FCFA)</th>
              <th className="px-4 py-3">Solde (FCFA)</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {factures.map((facture) => {
              const { locataire } = facture.contrat;
              const nomLocataire =
                locataire.type === "physique"
                  ? `${locataire.nom ?? ""} ${locataire.prenoms ?? ""}`
                  : locataire.raisonSociale;

              return (
                <tr key={facture.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{facture.numero}</td>
                  <td className="px-4 py-3">{facture.periode}</td>
                  <td className="px-4 py-3">{nomLocataire}</td>
                  <td className="px-4 py-3">{facture.contrat.bien.code}</td>
                  <td className="px-4 py-3">{Number(facture.totalAPayer).toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-3">{Number(facture.soldeRestant).toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${COULEURS_STATUT[facture.statut]}`}
                    >
                      {LIBELLES_STATUT[facture.statut]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`/api/factures/${facture.id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-700 hover:underline"
                    >
                      PDF
                    </a>
                  </td>
                </tr>
              );
            })}
            {factures.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                  Aucune facture émise.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
