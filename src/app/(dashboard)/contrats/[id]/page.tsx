import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  BoutonValiderContrat,
  BoutonValiderRevision,
  FormulaireCloture,
  FormulaireDecisionCaution,
  FormulaireRevisionLoyer,
} from "@/components/contrats/contrat-actions";

const LIBELLES_STATUT: Record<string, string> = {
  brouillon: "En attente de validation",
  actif: "Actif",
  resilie: "Résilié",
  termine: "Terminé",
};

export default async function PageDetailContrat({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "contrats", "lire")) redirect("/");

  const { id } = await params;
  const contrat = await prisma.contrat.findUnique({
    where: { id },
    include: {
      bien: true,
      locataire: true,
      caution: true,
      revisionsLoyer: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!contrat) notFound();

  const profil = session.user.profil;
  const nomLocataire =
    contrat.locataire.type === "physique"
      ? `${contrat.locataire.nom ?? ""} ${contrat.locataire.prenoms ?? ""}`
      : contrat.locataire.raisonSociale;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Contrat {contrat.numero}</h1>
        <a
          href={`/api/contrats/${contrat.id}/pdf`}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Télécharger le PDF
        </a>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <p>
          <span className="font-medium">Statut : </span>
          {LIBELLES_STATUT[contrat.statut]}
        </p>
        <p>
          <span className="font-medium">Bien : </span>
          {contrat.bien.designation} ({contrat.bien.code})
        </p>
        <p>
          <span className="font-medium">Locataire : </span>
          {nomLocataire}
        </p>
        <p>
          <span className="font-medium">Période : </span>
          {contrat.dateDebut.toLocaleDateString("fr-FR")} — {contrat.dateFin.toLocaleDateString("fr-FR")}
        </p>
        <p>
          <span className="font-medium">Loyer : </span>
          {Number(contrat.montantLoyer).toLocaleString("fr-FR")} FCFA ({contrat.periodicite})
        </p>
        <p>
          <span className="font-medium">Charges : </span>
          {Number(contrat.charges).toLocaleString("fr-FR")} FCFA
        </p>
        {contrat.caution && (
          <p>
            <span className="font-medium">Caution : </span>
            {Number(contrat.caution.montantInitial).toLocaleString("fr-FR")} FCFA — statut :{" "}
            {contrat.caution.statut}
          </p>
        )}
      </div>

      {contrat.statut === "brouillon" && peut(profil, "contrats.validation", "valider") && (
        <BoutonValiderContrat contratId={contrat.id} />
      )}

      {contrat.statut === "actif" && (
        <div className="space-y-4">
          {peut(profil, "revisionsLoyer.proposition", "creer") && (
            <FormulaireRevisionLoyer contratId={contrat.id} />
          )}

          {contrat.revisionsLoyer.length > 0 && (
            <div className="rounded-md border border-slate-200 p-4">
              <p className="mb-2 text-sm font-medium text-slate-700">Révisions de loyer</p>
              <ul className="space-y-2 text-sm">
                {contrat.revisionsLoyer.map((revision) => (
                  <li key={revision.id} className="flex items-center justify-between">
                    <span>
                      {Number(revision.ancienMontant).toLocaleString("fr-FR")} →{" "}
                      {Number(revision.nouveauMontant).toLocaleString("fr-FR")} FCFA —{" "}
                      {revision.motif} (
                      {revision.valideParId ? "validée" : "en attente"})
                    </span>
                    {!revision.valideParId && peut(profil, "revisionsLoyer.validation", "valider") && (
                      <BoutonValiderRevision contratId={contrat.id} revisionId={revision.id} />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {peut(profil, "contrats", "modifier") && <FormulaireCloture contratId={contrat.id} />}
        </div>
      )}

      {contrat.caution &&
        contrat.caution.statut === "detenue" &&
        contrat.statut !== "actif" &&
        contrat.statut !== "brouillon" &&
        peut(profil, "cautions.validation", "valider") && (
          <FormulaireDecisionCaution cautionId={contrat.caution.id} />
        )}
    </div>
  );
}
