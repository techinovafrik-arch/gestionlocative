"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PERIODICITES } from "@/lib/validations/contrat";

type Bien = { id: string; code: string; designation: string; loyer: string };
type Locataire = {
  id: string;
  code: string;
  type: "physique" | "entreprise";
  nom: string | null;
  prenoms: string | null;
  raisonSociale: string | null;
};

const LIBELLES_PERIODICITE: Record<(typeof PERIODICITES)[number], string> = {
  mensuelle: "Mensuelle",
  trimestrielle: "Trimestrielle",
  annuelle: "Annuelle",
};

function nomLocataire(locataire: Locataire) {
  return locataire.type === "physique"
    ? `${locataire.nom ?? ""} ${locataire.prenoms ?? ""}`
    : locataire.raisonSociale;
}

export function FormulaireContrat({ biens, locataires }: { biens: Bien[]; locataires: Locataire[] }) {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function onSubmit(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    setErreur(null);
    setEnCours(true);

    const f = new FormData(evenement.currentTarget);
    const montantCaution = f.get("montantCaution");

    const corps = {
      bienId: f.get("bienId"),
      locataireId: f.get("locataireId"),
      dateDebut: f.get("dateDebut"),
      dateFin: f.get("dateFin"),
      montantLoyer: Number(f.get("montantLoyer")),
      charges: Number(f.get("charges") || 0),
      montantCaution: montantCaution ? Number(montantCaution) : undefined,
      avanceLoyer: Number(f.get("avanceLoyer") || 0),
      periodicite: f.get("periodicite"),
      dateVersementCaution: f.get("dateVersementCaution"),
    };

    const reponse = await fetch("/api/contrats", {
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

    const { contrat } = await reponse.json();
    router.push(`/contrats/${contrat.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Bien (libre)</label>
          <select
            name="bienId"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {biens.map((bien) => (
              <option key={bien.id} value={bien.id}>
                {bien.code} — {bien.designation}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Locataire</label>
          <select
            name="locataireId"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {locataires.map((locataire) => (
              <option key={locataire.id} value={locataire.id}>
                {locataire.code} — {nomLocataire(locataire)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Date de début</label>
          <input
            name="dateDebut"
            type="date"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Date de fin</label>
          <input
            name="dateFin"
            type="date"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Périodicité</label>
        <select
          name="periodicite"
          required
          defaultValue="mensuelle"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {PERIODICITES.map((periodicite) => (
            <option key={periodicite} value={periodicite}>
              {LIBELLES_PERIODICITE[periodicite]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Loyer (FCFA)</label>
          <input
            name="montantLoyer"
            type="number"
            min={0}
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Charges (FCFA)</label>
          <input
            name="charges"
            type="number"
            min={0}
            defaultValue={0}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Caution (FCFA) — laisser vide pour 2 mois de loyer par défaut
          </label>
          <input
            name="montantCaution"
            type="number"
            min={0}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Avance sur loyer (FCFA)</label>
          <input
            name="avanceLoyer"
            type="number"
            min={0}
            defaultValue={0}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Date de versement de la caution</label>
        <input
          name="dateVersementCaution"
          type="date"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {erreur && <p className="text-sm text-red-600">{erreur}</p>}

      <button
        type="submit"
        disabled={enCours}
        className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
      >
        {enCours ? "Enregistrement..." : "Créer le contrat"}
      </button>
    </form>
  );
}
