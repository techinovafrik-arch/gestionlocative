"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TYPES_ENTITE_DOCUMENT } from "@/lib/validations/document";

type Option = { id: string; libelle: string };

const LIBELLES_TYPE_ENTITE: Record<(typeof TYPES_ENTITE_DOCUMENT)[number], string> = {
  bien: "Bien",
  locataire: "Locataire",
  contrat: "Contrat",
  facture: "Facture",
};

export function FormulaireDocument({
  optionsParType,
}: {
  optionsParType: Record<(typeof TYPES_ENTITE_DOCUMENT)[number], Option[]>;
}) {
  const router = useRouter();
  const [entiteType, setEntiteType] = useState<(typeof TYPES_ENTITE_DOCUMENT)[number]>("bien");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const options = useMemo(() => optionsParType[entiteType], [optionsParType, entiteType]);

  async function onSubmit(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    setErreur(null);
    setEnCours(true);

    const f = new FormData(evenement.currentTarget);
    const corps = {
      typeDocument: f.get("typeDocument"),
      reference: f.get("reference"),
      lienSecurise: f.get("lienSecurise"),
      entiteType,
      entiteId: f.get("entiteId"),
    };

    const reponse = await fetch("/api/documents", {
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

    router.push("/documents");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Type d&apos;élément</label>
        <select
          value={entiteType}
          onChange={(e) => setEntiteType(e.target.value as (typeof TYPES_ENTITE_DOCUMENT)[number])}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {TYPES_ENTITE_DOCUMENT.map((type) => (
            <option key={type} value={type}>
              {LIBELLES_TYPE_ENTITE[type]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          {LIBELLES_TYPE_ENTITE[entiteType]} concerné(e)
        </label>
        <select
          name="entiteId"
          required
          disabled={options.length === 0}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {options.length === 0 && <option value="">Aucun élément disponible</option>}
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.libelle}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Type de document</label>
        <input
          name="typeDocument"
          required
          placeholder="Ex. pièce d'identité, titre foncier, avenant..."
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Référence</label>
        <input
          name="reference"
          required
          placeholder="Nom ou libellé du document"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Lien sécurisé (Google Drive)
        </label>
        <input
          name="lienSecurise"
          type="url"
          required
          placeholder="https://drive.google.com/..."
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {erreur && <p className="text-sm text-red-600">{erreur}</p>}

      <button
        type="submit"
        disabled={enCours || options.length === 0}
        className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
      >
        {enCours ? "Enregistrement..." : "Rattacher le document"}
      </button>
    </form>
  );
}
