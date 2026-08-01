"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChampMotDePasse } from "@/components/ui/champ-mot-de-passe";

export default function PageConnexion() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [afficherAide, setAfficherAide] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);

    const resultat = await signIn("credentials", {
      email,
      password: motDePasse,
      redirect: false,
    });

    setEnCours(false);

    if (resultat?.error) {
      setErreur("Email ou mot de passe incorrect.");
      return;
    }

    router.push("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border border-slate-200 bg-white p-8 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-slate-900">
          CISSE MEDOUNE — Gestion locative
        </h1>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="password">
            Mot de passe
          </label>
          <ChampMotDePasse
            id="password"
            required
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        {erreur && <p className="text-sm text-red-600">{erreur}</p>}

        <button
          type="submit"
          disabled={enCours}
          className="w-full rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
        >
          {enCours ? "Connexion..." : "Se connecter"}
        </button>

        <button
          type="button"
          onClick={() => setAfficherAide((v) => !v)}
          className="w-full text-center text-sm text-blue-700 hover:underline"
        >
          Mot de passe oublié ?
        </button>

        {afficherAide && (
          <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
            Contactez votre Administrateur : il peut réinitialiser votre mot
            de passe depuis la rubrique Utilisateurs.
          </p>
        )}
      </form>
    </div>
  );
}
