import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const LIBELLES_STATUT: Record<string, string> = {
  detenue: "Détenue",
  remboursee: "Remboursée",
  remboursee_avec_retenue: "Remboursée avec retenue",
};

const COULEURS_STATUT: Record<string, string> = {
  detenue: "bg-blue-100 text-blue-800",
  remboursee: "bg-emerald-100 text-emerald-800",
  remboursee_avec_retenue: "bg-orange-100 text-orange-800",
};

// Section 13.4 (« État des cautions »), RG-K01 à RG-K05.
export default async function PageCautions() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "cautions", "lire")) redirect("/");

  const cautions = await prisma.caution.findMany({
    include: { contrat: { include: { bien: true, locataire: true } } },
    orderBy: { createdAt: "desc" },
  });

  const detenues = cautions.filter((c) => c.statut === "detenue").length;
  const remboursees = cautions.filter((c) => c.statut === "remboursee").length;
  const avecRetenue = cautions.filter((c) => c.statut === "remboursee_avec_retenue").length;

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-slate-900">Cautions ({cautions.length})</h1>
      <p className="mb-6 text-sm text-slate-600">
        Détenues : {detenues} · Remboursées : {remboursees} · Remboursées avec retenue : {avecRetenue}
      </p>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Contrat</th>
              <th className="px-4 py-3">Locataire</th>
              <th className="px-4 py-3">Bien</th>
              <th className="px-4 py-3">Montant initial (FCFA)</th>
              <th className="px-4 py-3">Retenu (FCFA)</th>
              <th className="px-4 py-3">Remboursé (FCFA)</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {cautions.map((caution) => {
              const { locataire, bien } = caution.contrat;
              const nomLocataire =
                locataire.type === "physique"
                  ? `${locataire.nom ?? ""} ${locataire.prenoms ?? ""}`
                  : locataire.raisonSociale;

              return (
                <tr key={caution.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{caution.contrat.numero}</td>
                  <td className="px-4 py-3">{nomLocataire}</td>
                  <td className="px-4 py-3">{bien.code}</td>
                  <td className="px-4 py-3">{Number(caution.montantInitial).toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-3">{Number(caution.montantRetenu ?? 0).toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-3">
                    {caution.montantRembourse !== null
                      ? Number(caution.montantRembourse).toLocaleString("fr-FR")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${COULEURS_STATUT[caution.statut]}`}
                    >
                      {LIBELLES_STATUT[caution.statut]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/contrats/${caution.contratId}`}
                      className="text-sm text-blue-700 hover:underline"
                    >
                      Voir le contrat
                    </Link>
                  </td>
                </tr>
              );
            })}
            {cautions.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                  Aucune caution enregistrée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
