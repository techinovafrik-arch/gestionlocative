import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";

const CATEGORIES = [
  { href: "/rapports/immobilier", label: "Rapports immobiliers", description: "Liste des biens, disponibilités, occupation, historique." },
  { href: "/rapports/locataires-contrats", label: "Rapports locataires et contrats", description: "Locataires actifs, historique, contrats à échéance." },
  { href: "/rapports/financier", label: "Rapports financiers", description: "Factures, journal des encaissements, relevé locataire." },
  { href: "/cautions", label: "État des cautions", description: "Cautions détenues, remboursées, avec retenue." },
  { href: "/rapports/synthese", label: "Rapports financiers de synthèse", description: "Loyers attendus/encaissés, balance des impayés." },
];

// CDC §16.1 : rapports consultables en ligne, exportables en PDF/Excel,
// imprimables (RG-X02). L'export PDF s'appuie sur l'impression navigateur
// (mise en page imprimable) ; l'export Excel est natif (bouton dédié).
export default async function PageRapports() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "rapports", "lire")) redirect("/");

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-slate-900">Rapports</h1>
      <p className="mb-6 text-sm text-slate-600">
        Consultables en ligne, exportables en Excel, imprimables directement (Ctrl+P / Cmd+P pour un export PDF).
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {CATEGORIES.map((categorie) => (
          <Link
            key={categorie.href}
            href={categorie.href}
            className="rounded-lg border border-slate-200 bg-white p-4 hover:border-blue-300 hover:bg-blue-50"
          >
            <p className="font-medium text-slate-900">{categorie.label}</p>
            <p className="mt-1 text-sm text-slate-600">{categorie.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
