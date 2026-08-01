"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ContratOption = { id: string; numero: string; bien: string; locataire: string };

// D-042 : génération manuelle ciblée sur un contrat, réservée à
// l'Administrateur et au Gestionnaire locatif (§14.1). Le contrat, le
// montant et la période ne sont jamais saisis librement — seul le contrat
// est choisi, le reste est calculé par le moteur de facturation.
export function GenererFacture({ contrats }: { contrats: ContratOption[] }) {
  const router = useRouter();
  const [contratId, setContratId] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function onSubmit(evenement: React.FormEvent) {
    evenement.preventDefault();
    setErreur(null);
    setSucces(null);
    setEnCours(true);

    const reponse = await fetch("/api/factures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contratId }),
    });

    setEnCours(false);

    if (!reponse.ok) {
      const donnees = await reponse.json().catch(() => null);
      setErreur(donnees?.erreur ?? "Une erreur est survenue.");
      return;
    }

    const donnees = await reponse.json();
    setSucces(`Facture ${donnees.facture.numero} générée.`);
    setContratId("");
    router.refresh();
  }

  if (contrats.length === 0) return null;

  return (
    <form onSubmit={onSubmit} className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Générer une facture pour un contrat
        </label>
        <select
          value={contratId}
          onChange={(e) => setContratId(e.target.value)}
          required
          className="mt-1 w-80 rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="" disabled>
            Sélectionner un contrat actif
          </option>
          {contrats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.numero} — {c.bien} — {c.locataire}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={enCours || !contratId}
        className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
      >
        {enCours ? "Génération..." : "Générer"}
      </button>
      {erreur && <p className="w-full text-sm text-red-600">{erreur}</p>}
      {succes && <p className="w-full text-sm text-emerald-700">{succes}</p>}
    </form>
  );
}
