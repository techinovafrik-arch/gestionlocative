import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { FormulaireCorrectionPaiement } from "@/components/paiements/paiement-correction";

const LIBELLES_MODE: Record<string, string> = {
  especes: "Espèces",
  virement: "Virement",
  cheque: "Chèque",
  orange_money: "Orange Money",
  mtn_money: "MTN Money",
  moov_money: "Moov Money",
  wave: "Wave",
};

const LIBELLES_STATUT: Record<string, string> = {
  valide: "Validé",
  corrige: "Corrigé",
  annule: "Annulé",
};

export default async function PagePaiements() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "paiements", "lire")) redirect("/");

  const paiements = await prisma.paiement.findMany({
    include: {
      facture: { include: { contrat: { include: { bien: true, locataire: true } } } },
      encaissePar: { select: { nom: true } },
      quittance: true,
    },
    orderBy: { datePaiement: "desc" },
  });

  const profil = session.user.profil;
  const peutCreer = peut(profil, "paiements", "creer");
  const peutCorriger = peut(profil, "paiements.correction", "valider");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Paiements ({paiements.length})</h1>
        {peutCreer && (
          <Link
            href="/paiements/nouveau"
            className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            Nouveau paiement
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Référence</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Locataire</th>
              <th className="px-4 py-3">Facture</th>
              <th className="px-4 py-3">Montant (FCFA)</th>
              <th className="px-4 py-3">Mode</th>
              <th className="px-4 py-3">Encaissé par</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {paiements.map((paiement) => {
              const { locataire } = paiement.facture.contrat;
              const nomLocataire =
                locataire.type === "physique"
                  ? `${locataire.nom ?? ""} ${locataire.prenoms ?? ""}`
                  : locataire.raisonSociale;

              return (
                <tr key={paiement.id} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-3 font-medium">{paiement.reference}</td>
                  <td className="px-4 py-3">{paiement.datePaiement.toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-3">{nomLocataire}</td>
                  <td className="px-4 py-3">{paiement.facture.numero}</td>
                  <td className="px-4 py-3">{Number(paiement.montant).toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-3">{LIBELLES_MODE[paiement.mode]}</td>
                  <td className="px-4 py-3">{paiement.encaissePar.nom}</td>
                  <td className="px-4 py-3">{LIBELLES_STATUT[paiement.statut]}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-end gap-1">
                      {paiement.quittance && (
                        <a
                          href={`/api/quittances/${paiement.quittance.id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-700 hover:underline"
                        >
                          Quittance PDF
                        </a>
                      )}
                      {peutCorriger && <FormulaireCorrectionPaiement paiementId={paiement.id} />}
                    </div>
                  </td>
                </tr>
              );
            })}
            {paiements.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-slate-500">
                  Aucun paiement enregistré.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
