import { auth } from "@/lib/auth";

// Tableau de bord détaillé (indicateurs, graphiques) : section 13, Sprint 7.
export default async function PageAccueil() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">
        Bienvenue, {session?.user?.name}
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Le tableau de bord (indicateurs, graphiques) sera disponible au Sprint 7. Utilisez le
        menu pour accéder aux Biens, Locataires et Utilisateurs.
      </p>
    </div>
  );
}
