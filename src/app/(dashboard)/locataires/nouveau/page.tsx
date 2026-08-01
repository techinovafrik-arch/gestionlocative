import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import { FormulaireLocataire } from "@/components/locataires/locataire-form";

export default async function PageNouveauLocataire() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "locataires", "creer")) redirect("/locataires");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Nouveau locataire</h1>
      <FormulaireLocataire />
    </div>
  );
}
