import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";

const LIMITE = 200;

const LIBELLES_ENTITE: Record<string, string> = {
  bien: "Bien",
  locataire: "Locataire",
  contrat: "Contrat",
  facture: "Facture",
  paiement: "Paiement",
  caution: "Caution",
  utilisateur: "Utilisateur",
  document: "Document",
  revision_loyer: "Révision de loyer",
};

// RG-U03, dossier §14.3 : journal d'audit consultable par l'Administrateur et
// le Gérant, filtrable par utilisateur, date, entité.
export default async function PageAudit({
  searchParams,
}: {
  searchParams: Promise<{ utilisateurId?: string; entiteType?: string; du?: string; au?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "audit", "lire")) redirect("/");

  const { utilisateurId, entiteType, du, au } = await searchParams;

  const utilisateurs = await prisma.utilisateur.findMany({ orderBy: { nom: "asc" } });

  const where: Prisma.AuditWhereInput = {};
  if (utilisateurId) where.utilisateurId = utilisateurId;
  if (entiteType) where.entiteType = entiteType;
  if (du || au) {
    where.dateHeure = {
      ...(du ? { gte: new Date(du) } : {}),
      ...(au ? { lte: new Date(`${au}T23:59:59`) } : {}),
    };
  }

  const entrees = await prisma.audit.findMany({
    where,
    include: { utilisateur: true },
    orderBy: { dateHeure: "desc" },
    take: LIMITE,
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Journal d&apos;audit</h1>

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Utilisateur</label>
          <select
            name="utilisateurId"
            defaultValue={utilisateurId ?? ""}
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Tous</option>
            {utilisateurs.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Entité</label>
          <select
            name="entiteType"
            defaultValue={entiteType ?? ""}
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Toutes</option>
            {Object.entries(LIBELLES_ENTITE).map(([valeur, libelle]) => (
              <option key={valeur} value={valeur}>
                {libelle}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Du</label>
          <input
            type="date"
            name="du"
            defaultValue={du ?? ""}
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Au</label>
          <input
            type="date"
            name="au"
            defaultValue={au ?? ""}
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Filtrer
        </button>
      </form>

      <p className="mb-3 text-xs text-slate-500">
        {entrees.length} entrée(s) affichée(s) {entrees.length === LIMITE ? `(limité aux ${LIMITE} plus récentes — affinez les filtres pour voir davantage)` : ""}
      </p>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Date/heure</th>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entité</th>
            </tr>
          </thead>
          <tbody>
            {entrees.map((entree) => (
              <tr key={entree.id} className="border-t border-slate-100">
                <td className="px-4 py-3 whitespace-nowrap">
                  {entree.dateHeure.toLocaleString("fr-FR")}
                </td>
                <td className="px-4 py-3">{entree.utilisateur.nom}</td>
                <td className="px-4 py-3">{entree.action}</td>
                <td className="px-4 py-3">
                  {LIBELLES_ENTITE[entree.entiteType] ?? entree.entiteType}
                </td>
              </tr>
            ))}
            {entrees.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  Aucune entrée pour ces filtres.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
