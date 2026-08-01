import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { FormulaireContrat } from "@/components/contrats/contrat-form";

export default async function PageNouveauContrat() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "contrats", "creer")) redirect("/contrats");

  const [biens, locataires] = await Promise.all([
    prisma.bien.findMany({ where: { statut: "libre" }, orderBy: { code: "asc" } }),
    prisma.locataire.findMany({ where: { statut: "actif" }, orderBy: { code: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Nouveau contrat</h1>
      {biens.length === 0 ? (
        <p className="text-sm text-slate-600">Aucun bien libre disponible pour un nouveau contrat.</p>
      ) : locataires.length === 0 ? (
        <p className="text-sm text-slate-600">Aucun locataire actif disponible.</p>
      ) : (
        <FormulaireContrat
          biens={biens.map((bien) => ({
            id: bien.id,
            code: bien.code,
            designation: bien.designation,
            loyer: bien.loyer.toString(),
          }))}
          locataires={locataires}
        />
      )}
    </div>
  );
}
