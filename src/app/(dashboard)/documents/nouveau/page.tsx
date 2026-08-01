import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { FormulaireDocument } from "@/components/documents/document-form";

export default async function PageNouveauDocument() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "documents", "creer")) redirect("/documents");

  const [biens, locataires, contrats, factures] = await Promise.all([
    prisma.bien.findMany({ orderBy: { code: "asc" } }),
    prisma.locataire.findMany({ orderBy: { code: "asc" } }),
    prisma.contrat.findMany({ orderBy: { numero: "asc" } }),
    prisma.facture.findMany({ orderBy: { numero: "asc" } }),
  ]);

  const optionsParType = {
    bien: biens.map((bien) => ({ id: bien.id, libelle: `${bien.code} — ${bien.designation}` })),
    locataire: locataires.map((locataire) => ({
      id: locataire.id,
      libelle: `${locataire.code} — ${
        locataire.type === "physique" ? `${locataire.nom} ${locataire.prenoms}` : locataire.raisonSociale
      }`,
    })),
    contrat: contrats.map((contrat) => ({ id: contrat.id, libelle: contrat.numero })),
    facture: factures.map((facture) => ({ id: facture.id, libelle: `${facture.numero} (${facture.periode})` })),
  };

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Nouveau document</h1>
      <FormulaireDocument optionsParType={optionsParType} />
    </div>
  );
}
