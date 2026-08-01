import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import { BoutonDeconnexion } from "@/components/sign-out-button";

const LIENS = [
  { href: "/", label: "Tableau de bord" },
  { href: "/notifications", label: "Notifications" },
  { href: "/biens", label: "Biens", ressource: "biens" as const },
  { href: "/locataires", label: "Locataires", ressource: "locataires" as const },
  { href: "/contrats", label: "Contrats", ressource: "contrats" as const },
  { href: "/factures", label: "Factures", ressource: "factures" as const },
  { href: "/paiements", label: "Paiements", ressource: "paiements" as const },
  { href: "/cautions", label: "Cautions", ressource: "cautions" as const },
  { href: "/documents", label: "Documents", ressource: "documents" as const },
  { href: "/rapports", label: "Rapports", ressource: "rapports" as const },
  { href: "/utilisateurs", label: "Utilisateurs", ressource: "utilisateurs" as const },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/connexion");
  }

  const profil = session.user.profil;

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col bg-blue-900 text-white">
        <div className="border-b border-blue-800 px-4 py-4">
          <p className="text-sm font-semibold">CISSE MEDOUNE</p>
          <p className="text-xs text-blue-200">Gestion locative</p>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4">
          {LIENS.filter((lien) => !lien.ressource || peut(profil, lien.ressource, "lire")).map(
            (lien) => (
              <Link
                key={lien.href}
                href={lien.href}
                className="block rounded-md px-3 py-2 text-sm text-blue-100 hover:bg-blue-800"
              >
                {lien.label}
              </Link>
            ),
          )}
        </nav>

        <div className="border-t border-blue-800 px-4 py-3 text-xs text-blue-200">
          <p>{session.user.name}</p>
          <p className="mb-2 capitalize">{profil}</p>
          <BoutonDeconnexion />
        </div>
      </aside>

      <main className="flex-1 bg-slate-50 p-8">{children}</main>
    </div>
  );
}
