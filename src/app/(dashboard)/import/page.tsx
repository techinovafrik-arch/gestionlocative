import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import { FormulaireImport } from "@/components/import/formulaire-import";

// EF-32, D-011 : reprise des données existantes (biens, locataires, contrats
// en cours) au démarrage. Réservé à l'Administrateur (D-041, §14.1).
export default async function PageImport() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "import", "lire")) redirect("/");

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-slate-900">Import de données</h1>
      <p className="mb-6 max-w-2xl text-sm text-slate-600">
        Reprise initiale des biens, locataires et contrats en cours (CDC §3,
        D-011). Téléchargez le modèle, remplissez-le, puis analysez le fichier
        avant de confirmer l&apos;import — aucune donnée n&apos;est écrite tant
        que le classeur contient des erreurs.
      </p>
      <FormulaireImport />
    </div>
  );
}
