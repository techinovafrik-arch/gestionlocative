"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// RG-P04 : correction d'un paiement par le gérant.
export function FormulaireCorrectionPaiement({ paiementId }: { paiementId: string }) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function onSubmit(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    setErreur(null);
    setEnCours(true);

    const f = new FormData(evenement.currentTarget);
    const reponse = await fetch(`/api/paiements/${paiementId}/corriger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nouveauMontant: f.get("nouveauMontant") ? Number(f.get("nouveauMontant")) : undefined,
        motif: f.get("motif"),
      }),
    });

    setEnCours(false);

    if (!reponse.ok) {
      const donnees = await reponse.json().catch(() => null);
      setErreur(donnees?.erreur ?? "Une erreur est survenue.");
      return;
    }

    setOuvert(false);
    router.refresh();
  }

  if (!ouvert) {
    return (
      <button onClick={() => setOuvert(true)} className="text-xs text-blue-700 hover:underline">
        Corriger
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-2 space-y-2 rounded-md border border-slate-200 p-3">
      <input
        name="nouveauMontant"
        type="number"
        min={1}
        placeholder="Nouveau montant (FCFA)"
        className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
      />
      <input
        name="motif"
        required
        placeholder="Motif de la correction"
        className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
      />
      {erreur && <p className="text-xs text-red-600">{erreur}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={enCours}
          className="rounded-md bg-orange-600 px-3 py-1 text-xs font-medium text-white hover:bg-orange-700 disabled:opacity-50"
        >
          {enCours ? "..." : "Valider"}
        </button>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-600"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
