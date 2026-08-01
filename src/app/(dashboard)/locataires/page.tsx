import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function PageLocataires() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "locataires", "lire")) redirect("/");

  const locataires = await prisma.locataire.findMany({
    where: { statut: "actif" },
    orderBy: { code: "asc" },
  });

  const peutCreer = peut(session.user.profil, "locataires", "creer");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">
          Locataires actifs ({locataires.length})
        </h1>
        {peutCreer && (
          <Link
            href="/locataires/nouveau"
            className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            Nouveau locataire
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Nom / Raison sociale</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Email</th>
            </tr>
          </thead>
          <tbody>
            {locataires.map((locataire) => (
              <tr key={locataire.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{locataire.code}</td>
                <td className="px-4 py-3 capitalize">{locataire.type}</td>
                <td className="px-4 py-3">
                  {locataire.type === "physique"
                    ? `${locataire.civilite ?? ""} ${locataire.nom ?? ""} ${locataire.prenoms ?? ""}`
                    : locataire.raisonSociale}
                </td>
                <td className="px-4 py-3">{locataire.telephonePrincipal}</td>
                <td className="px-4 py-3">{locataire.email ?? "—"}</td>
              </tr>
            ))}
            {locataires.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Aucun locataire actif.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
