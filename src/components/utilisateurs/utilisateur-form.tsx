"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROFILS_UTILISATEUR } from "@/lib/validations/utilisateur";

const LIBELLES_PROFIL: Record<(typeof PROFILS_UTILISATEUR)[number], string> = {
  administrateur: "Administrateur",
  gerant: "Gérant",
  gestionnaire: "Gestionnaire locatif",
  consultation: "Consultation",
};

export function FormulaireUtilisateur() {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function onSubmit(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    setErreur(null);
    setEnCours(true);

    const f = new FormData(evenement.currentTarget);
    const corps = {
      nom: f.get("nom"),
      email: f.get("email"),
      motDePasse: f.get("motDePasse"),
      profil: f.get("profil"),
    };

    const reponse = await fetch("/api/utilisateurs", {
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

    router.push("/utilisateurs");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Nom</label>
        <input
          name="nom"
          required
          maxLength={150}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Profil</label>
        <select
          name="profil"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {PROFILS_UTILISATEUR.map((profil) => (
            <option key={profil} value={profil}>
              {LIBELLES_PROFIL[profil]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Mot de passe initial</label>
        <input
          name="motDePasse"
          type="password"
          required
          minLength={8}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-slate-500">
          8 caractères minimum, au moins une majuscule et un chiffre.
        </p>
      </div>

      {erreur && <p className="text-sm text-red-600">{erreur}</p>}

      <button
        type="submit"
        disabled={enCours}
        className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
      >
        {enCours ? "Enregistrement..." : "Créer le compte"}
      </button>
    </form>
  );
}
