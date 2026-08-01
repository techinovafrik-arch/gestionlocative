"use client";

import { signOut } from "next-auth/react";

export function BoutonDeconnexion() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/connexion" })}
      className="rounded-md px-3 py-1.5 text-sm text-blue-100 hover:bg-blue-800"
    >
      Déconnexion
    </button>
  );
}
