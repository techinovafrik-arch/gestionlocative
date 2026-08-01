"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TYPES_PIECE_IDENTITE } from "@/lib/validations/locataire";

const LIBELLES_PIECE: Record<(typeof TYPES_PIECE_IDENTITE)[number], string> = {
  passeport: "Passeport",
  cni: "Carte Nationale d'Identité",
  carte_consulaire: "Carte consulaire",
  permis: "Permis de conduire",
};

export function FormulaireLocataire() {
  const router = useRouter();
  const [type, setType] = useState<"physique" | "entreprise">("physique");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function onSubmit(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    setErreur(null);
    setEnCours(true);

    const f = new FormData(evenement.currentTarget);

    const commun = {
      type,
      telephonePrincipal: f.get("telephonePrincipal"),
      telephoneSecondaire: f.get("telephoneSecondaire") || undefined,
      email: f.get("email") || undefined,
      contactUrgence: f.get("contactUrgence") || undefined,
      pieceIdentite: {
        type: f.get("pieceType"),
        numero: f.get("pieceNumero"),
        dateExpiration: f.get("pieceDateExpiration") || undefined,
      },
    };

    const corps =
      type === "physique"
        ? {
            ...commun,
            civilite: f.get("civilite"),
            nom: f.get("nom"),
            prenoms: f.get("prenoms"),
            dateNaissance: f.get("dateNaissance"),
            nationalite: f.get("nationalite"),
            profession: f.get("profession") || undefined,
          }
        : {
            ...commun,
            raisonSociale: f.get("raisonSociale"),
            infosAdministratives: f.get("infosAdministratives") || undefined,
            representant: f.get("representant"),
          };

    const reponse = await fetch("/api/locataires", {
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

    router.push("/locataires");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Type de locataire</label>
        <div className="mt-1 flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={type === "physique"}
              onChange={() => setType("physique")}
            />
            Personne physique
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={type === "entreprise"}
              onChange={() => setType("entreprise")}
            />
            Entreprise
          </label>
        </div>
      </div>

      {type === "physique" ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Civilité</label>
            <input
              name="civilite"
              required
              maxLength={10}
              placeholder="M. / Mme"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Nationalité</label>
            <input
              name="nationalite"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Nom</label>
            <input
              name="nom"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Prénoms</label>
            <input
              name="prenoms"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Date de naissance</label>
            <input
              name="dateNaissance"
              type="date"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Profession</label>
            <input
              name="profession"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Raison sociale</label>
            <input
              name="raisonSociale"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Représentant</label>
            <input
              name="representant"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Informations administratives
            </label>
            <textarea
              name="infosAdministratives"
              rows={2}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Téléphone principal</label>
          <input
            name="telephonePrincipal"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Téléphone secondaire
          </label>
          <input
            name="telephoneSecondaire"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            name="email"
            type="email"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Contact d&apos;urgence</label>
          <input
            name="contactUrgence"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <fieldset className="rounded-md border border-slate-200 p-4">
        <legend className="px-1 text-sm font-medium text-slate-700">Pièce d&apos;identité</legend>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Type</label>
            <select
              name="pieceType"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {TYPES_PIECE_IDENTITE.map((t) => (
                <option key={t} value={t}>
                  {LIBELLES_PIECE[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Numéro</label>
            <input
              name="pieceNumero"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Date d&apos;expiration</label>
            <input
              name="pieceDateExpiration"
              type="date"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </fieldset>

      {erreur && <p className="text-sm text-red-600">{erreur}</p>}

      <button
        type="submit"
        disabled={enCours}
        className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
      >
        {enCours ? "Enregistrement..." : "Enregistrer le locataire"}
      </button>
    </form>
  );
}
