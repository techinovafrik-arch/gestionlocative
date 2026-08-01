"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChampMotDePasse } from "@/components/ui/champ-mot-de-passe";

// Réinitialisation d'un mot de passe oublié : mécanisme retenu (pas de
// fournisseur email choisi à ce stade — points ouverts). L'Administrateur
// définit un nouveau mot de passe temporaire depuis la rubrique Utilisateurs.
export function ReinitialiserMotDePasse({ utilisateurId }: { utilisateurId: string }) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [succes, setSucces] = useState(false);

  async function onSubmit(evenement: React.FormEvent) {
    evenement.preventDefault();
    setErreur(null);
    setEnCours(true);

    const reponse = await fetch(`/api/utilisateurs/${utilisateurId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motDePasse }),
    });

    setEnCours(false);

    if (!reponse.ok) {
      const donnees = await reponse.json().catch(() => null);
      setErreur(donnees?.erreur ?? "Une erreur est survenue.");
      return;
    }

    setOuvert(false);
    setMotDePasse("");
    setSucces(true);
    router.refresh();
  }

  if (!ouvert) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setOuvert(true);
            setSucces(false);
          }}
          className="text-xs font-medium text-blue-700 hover:underline"
        >
          Réinitialiser le mot de passe
        </button>
        {succes && <span className="text-xs text-emerald-700">Mot de passe mis à jour.</span>}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <ChampMotDePasse
        value={motDePasse}
        onChange={(e) => setMotDePasse(e.target.value)}
        required
        minLength={8}
        autoFocus
        placeholder="Nouveau mot de passe"
        className="w-44 rounded-md border border-slate-300 px-2 py-1 text-xs"
      />
      <button
        type="submit"
        disabled={enCours}
        className="rounded-md bg-orange-600 px-2 py-1 text-xs font-medium text-white hover:bg-orange-700 disabled:opacity-50"
      >
        {enCours ? "..." : "Valider"}
      </button>
      <button
        type="button"
        onClick={() => {
          setOuvert(false);
          setErreur(null);
        }}
        className="text-xs text-slate-500 hover:underline"
      >
        Annuler
      </button>
      {erreur && <span className="text-xs text-red-600">{erreur}</span>}
    </form>
  );
}
