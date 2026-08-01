import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const LIBELLES_STATUT: Record<string, string> = {
  libre: "Libre",
  occupe: "Occupé",
  en_travaux: "En travaux",
};

const COULEURS_STATUT: Record<string, string> = {
  libre: "bg-emerald-100 text-emerald-800",
  occupe: "bg-blue-100 text-blue-800",
  en_travaux: "bg-orange-100 text-orange-800",
};

export default async function PageBiens() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "biens", "lire")) redirect("/");

  const biens = await prisma.bien.findMany({
    include: { quartier: { include: { commune: true } } },
    orderBy: { code: "asc" },
  });

  const peutCreer = peut(session.user.profil, "biens", "creer");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Biens ({biens.length})</h1>
        {peutCreer && (
          <Link
            href="/biens/nouveau"
            className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            Nouveau bien
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Désignation</th>
              <th className="px-4 py-3">Localisation</th>
              <th className="px-4 py-3">Loyer (FCFA)</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {biens.map((bien) => (
              <tr key={bien.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{bien.code}</td>
                <td className="px-4 py-3 capitalize">{bien.type.replace("_", " ")}</td>
                <td className="px-4 py-3">{bien.designation}</td>
                <td className="px-4 py-3">
                  {bien.quartier.nom}, {bien.quartier.commune.nom}
                </td>
                <td className="px-4 py-3">{Number(bien.loyer).toLocaleString("fr-FR")}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${COULEURS_STATUT[bien.statut]}`}
                  >
                    {LIBELLES_STATUT[bien.statut]}
                  </span>
                </td>
              </tr>
            ))}
            {biens.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  Aucun bien enregistré.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
