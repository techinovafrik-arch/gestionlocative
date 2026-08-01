import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { FormulairePaiement } from "@/components/paiements/paiement-form";

export default async function PageNouveauPaiement() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "paiements", "creer")) redirect("/paiements");

  const locataires = await prisma.locataire.findMany({
    where: {
      contrats: {
        some: {
          factures: { some: { statut: { in: ["emise", "partiellement_payee", "impayee"] } } },
        },
      },
    },
    orderBy: { code: "asc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Nouveau paiement</h1>
      <FormulairePaiement locataires={locataires} />
    </div>
  );
}
