import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const LIBELLES_TYPE_ENTITE: Record<string, string> = {
  bien: "Bien",
  locataire: "Locataire",
  contrat: "Contrat",
  facture: "Facture",
};

async function resoudreLibelleEntite(entiteType: string, entiteId: string): Promise<string> {
  switch (entiteType) {
    case "bien": {
      const bien = await prisma.bien.findUnique({ where: { id: entiteId } });
      return bien ? `${bien.code} — ${bien.designation}` : "Bien supprimé";
    }
    case "locataire": {
      const locataire = await prisma.locataire.findUnique({ where: { id: entiteId } });
      if (!locataire) return "Locataire supprimé";
      return locataire.type === "physique"
        ? `${locataire.code} — ${locataire.nom} ${locataire.prenoms}`
        : `${locataire.code} — ${locataire.raisonSociale}`;
    }
    case "contrat": {
      const contrat = await prisma.contrat.findUnique({ where: { id: entiteId } });
      return contrat ? contrat.numero : "Contrat supprimé";
    }
    case "facture": {
      const facture = await prisma.facture.findUnique({ where: { id: entiteId } });
      return facture ? `${facture.numero} (${facture.periode})` : "Facture supprimée";
    }
    default:
      return entiteId;
  }
}

export default async function PageDocuments() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "documents", "lire")) redirect("/");

  const documents = await prisma.document.findMany({
    include: { ajoutePar: { select: { nom: true } } },
    orderBy: { dateAjout: "desc" },
  });

  const documentsAvecLibelle = await Promise.all(
    documents.map(async (document) => ({
      ...document,
      libelleEntite: await resoudreLibelleEntite(document.entiteType, document.entiteId),
    })),
  );

  const peutCreer = peut(session.user.profil, "documents", "creer");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Documents ({documents.length})</h1>
        {peutCreer && (
          <Link
            href="/documents/nouveau"
            className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            Nouveau document
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Référence</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Rattaché à</th>
              <th className="px-4 py-3">Ajouté par</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {documentsAvecLibelle.map((document) => (
              <tr key={document.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{document.reference}</td>
                <td className="px-4 py-3">{document.typeDocument}</td>
                <td className="px-4 py-3">
                  {LIBELLES_TYPE_ENTITE[document.entiteType]} — {document.libelleEntite}
                </td>
                <td className="px-4 py-3">{document.ajoutePar.nom}</td>
                <td className="px-4 py-3">{document.dateAjout.toLocaleDateString("fr-FR")}</td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={document.lienSecurise}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-700 hover:underline"
                  >
                    Ouvrir
                  </a>
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  Aucun document rattaché.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
