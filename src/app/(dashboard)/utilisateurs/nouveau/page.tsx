import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import { FormulaireUtilisateur } from "@/components/utilisateurs/utilisateur-form";

export default async function PageNouvelUtilisateur() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "utilisateurs", "creer")) redirect("/utilisateurs");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Nouvel utilisateur</h1>
      <FormulaireUtilisateur />
    </div>
  );
}
