import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { peut } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { FormulaireBien } from "@/components/biens/bien-form";

export default async function PageNouveauBien() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (!peut(session.user.profil, "biens", "creer")) redirect("/biens");

  const quartiers = await prisma.quartier.findMany({
    include: { commune: true },
    orderBy: { nom: "asc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Nouveau bien</h1>
      <FormulaireBien quartiers={quartiers} />
    </div>
  );
}
