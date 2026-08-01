import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function PageUtilisateurs() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "utilisateurs", "lire")) redirect("/");

  const utilisateurs = await prisma.utilisateur.findMany({
    select: { id: true, nom: true, email: true, profil: true, actif: true },
    orderBy: { nom: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">
          Utilisateurs ({utilisateurs.length})
        </h1>
        <Link
          href="/utilisateurs/nouveau"
          className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
        >
          Nouvel utilisateur
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Profil</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {utilisateurs.map((utilisateur) => (
              <tr key={utilisateur.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{utilisateur.nom}</td>
                <td className="px-4 py-3">{utilisateur.email}</td>
                <td className="px-4 py-3 capitalize">{utilisateur.profil}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      utilisateur.actif
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {utilisateur.actif ? "Actif" : "Désactivé"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
