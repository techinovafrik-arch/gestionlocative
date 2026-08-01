"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TYPES_BIEN } from "@/lib/validations/bien";

type Quartier = { id: string; nom: string; commune: { nom: string } };

const LIBELLES_TYPE: Record<(typeof TYPES_BIEN)[number], string> = {
  maison: "Maison",
  villa: "Villa",
  appartement: "Appartement",
  studio: "Studio",
  chambre: "Chambre",
  bureau: "Bureau",
  magasin: "Magasin",
  entrepot: "Entrepôt",
  terrain: "Terrain",
  immeuble: "Immeuble",
  local_commercial: "Local commercial",
};

export function FormulaireBien({ quartiers }: { quartiers: Quartier[] }) {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function onSubmit(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    setErreur(null);
    setEnCours(true);

    const formulaire = new FormData(evenement.currentTarget);
    const corps = {
      type: formulaire.get("type"),
      designation: formulaire.get("designation"),
      description: formulaire.get("description") || undefined,
      quartierId: formulaire.get("quartierId"),
      adresse: formulaire.get("adresse"),
      loyer: Number(formulaire.get("loyer")),
      chargesMensuelles: Number(formulaire.get("chargesMensuelles") || 0),
    };

    const reponse = await fetch("/api/biens", {
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

    router.push("/biens");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Type</label>
          <select
            name="type"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {TYPES_BIEN.map((type) => (
              <option key={type} value={type}>
                {LIBELLES_TYPE[type]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Quartier</label>
          <select
            name="quartierId"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {quartiers.map((quartier) => (
              <option key={quartier.id} value={quartier.id}>
                {quartier.nom} ({quartier.commune.nom})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Désignation</label>
        <input
          name="designation"
          required
          maxLength={150}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Adresse</label>
        <input
          name="adresse"
          required
          maxLength={255}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Description</label>
        <textarea
          name="description"
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Loyer (FCFA)</label>
          <input
            name="loyer"
            type="number"
            min={0}
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Charges mensuelles (FCFA)
          </label>
          <input
            name="chargesMensuelles"
            type="number"
            min={0}
            defaultValue={0}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {erreur && <p className="text-sm text-red-600">{erreur}</p>}

      <button
        type="submit"
        disabled={enCours}
        className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
      >
        {enCours ? "Enregistrement..." : "Enregistrer le bien"}
      </button>
    </form>
  );
}
