import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const LIBELLES_STATUT: Record<string, string> = {
  brouillon: "En attente de validation",
  actif: "Actif",
  resilie: "Résilié",
  termine: "Terminé",
};

const COULEURS_STATUT: Record<string, string> = {
  brouillon: "bg-orange-100 text-orange-800",
  actif: "bg-emerald-100 text-emerald-800",
  resilie: "bg-red-100 text-red-800",
  termine: "bg-slate-200 text-slate-600",
};

export default async function PageContrats() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "contrats", "lire")) redirect("/");

  const contrats = await prisma.contrat.findMany({
    include: { bien: true, locataire: true },
    orderBy: { numero: "desc" },
  });

  const peutCreer = peut(session.user.profil, "contrats", "creer");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Contrats ({contrats.length})</h1>
        {peutCreer && (
          <Link
            href="/contrats/nouveau"
            className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            Nouveau contrat
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Numéro</th>
              <th className="px-4 py-3">Bien</th>
              <th className="px-4 py-3">Locataire</th>
              <th className="px-4 py-3">Loyer (FCFA)</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {contrats.map((contrat) => (
              <tr key={contrat.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{contrat.numero}</td>
                <td className="px-4 py-3">{contrat.bien.designation}</td>
                <td className="px-4 py-3">
                  {contrat.locataire.type === "physique"
                    ? `${contrat.locataire.nom ?? ""} ${contrat.locataire.prenoms ?? ""}`
                    : contrat.locataire.raisonSociale}
                </td>
                <td className="px-4 py-3">{Number(contrat.montantLoyer).toLocaleString("fr-FR")}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${COULEURS_STATUT[contrat.statut]}`}
                  >
                    {LIBELLES_STATUT[contrat.statut]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/contrats/${contrat.id}`} className="text-sm text-blue-700 hover:underline">
                    Détail
                  </Link>
                </td>
              </tr>
            ))}
            {contrats.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  Aucun contrat enregistré.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
