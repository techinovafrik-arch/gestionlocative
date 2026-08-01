"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MODES_PAIEMENT } from "@/lib/validations/paiement";

type Locataire = {
  id: string;
  code: string;
  type: "physique" | "entreprise";
  nom: string | null;
  prenoms: string | null;
  raisonSociale: string | null;
};

type FactureDue = {
  numero: string;
  periode: string;
  soldeRestant: string;
  dateEcheance: string;
};

const LIBELLES_MODE: Record<(typeof MODES_PAIEMENT)[number], string> = {
  especes: "Espèces",
  virement: "Virement bancaire",
  cheque: "Chèque",
  orange_money: "Orange Money",
  mtn_money: "MTN Money",
  moov_money: "Moov Money",
  wave: "Wave",
};

function nomLocataire(locataire: Locataire) {
  return locataire.type === "physique"
    ? `${locataire.nom ?? ""} ${locataire.prenoms ?? ""}`
    : locataire.raisonSociale;
}

export function FormulairePaiement({ locataires }: { locataires: Locataire[] }) {
  const router = useRouter();
  const [locataireId, setLocataireId] = useState(locataires[0]?.id ?? "");
  const [factureDue, setFactureDue] = useState<FactureDue | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    if (!locataireId) return;
    fetch(`/api/factures?locataireId=${locataireId}&dues=true`)
      .then((r) => r.json())
      .then((donnees) => setFactureDue(donnees.factures?.[0] ?? null))
      .catch(() => setFactureDue(null));
  }, [locataireId]);

  async function onSubmit(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    setErreur(null);
    setEnCours(true);

    const f = new FormData(evenement.currentTarget);
    const corps = {
      locataireId,
      montant: Number(f.get("montant")),
      mode: f.get("mode"),
      datePaiement: f.get("datePaiement"),
    };

    const reponse = await fetch("/api/paiements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corps),
    });

    setEnCours(false);

    if (!reponse.ok) {
      const donnees = await reponse.json().catch(() => null);
      setErreur(donnees?.erreur ?? "Une erreur est survenue.");
      return;
    }

    router.push("/paiements");
    router.refresh();
  }

  if (locataires.length === 0) {
    return <p className="text-sm text-slate-600">Aucun locataire n&apos;a de facture due actuellement.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Locataire</label>
        <select
          value={locataireId}
          onChange={(e) => setLocataireId(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {locataires.map((locataire) => (
            <option key={locataire.id} value={locataire.id}>
              {locataire.code} — {nomLocataire(locataire)}
            </option>
          ))}
        </select>
      </div>

      {factureDue ? (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          Facture la plus ancienne due : <strong>{factureDue.numero}</strong> ({factureDue.periode}) —
          solde restant : {Number(factureDue.soldeRestant).toLocaleString("fr-FR")} FCFA (échéance{" "}
          {new Date(factureDue.dateEcheance).toLocaleDateString("fr-FR")}). Le paiement s&apos;imputera
          automatiquement sur cette facture (RG-P06).
        </div>
      ) : (
        <p className="text-sm text-slate-500">Aucune facture due pour ce locataire actuellement.</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Montant (FCFA)</label>
          <input
            name="montant"
            type="number"
            min={1}
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Mode de paiement</label>
          <select
            name="mode"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {MODES_PAIEMENT.map((mode) => (
              <option key={mode} value={mode}>
                {LIBELLES_MODE[mode]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Date du paiement</label>
        <input
          name="datePaiement"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {erreur && <p className="text-sm text-red-600">{erreur}</p>}

      <button
        type="submit"
        disabled={enCours || !factureDue}
        className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
      >
        {enCours ? "Enregistrement..." : "Enregistrer le paiement"}
      </button>
    </form>
  );
}
