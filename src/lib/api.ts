import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { peut, type Action, type Ressource } from "@/lib/permissions";
import { ErreurPaiement } from "@/lib/paiements";
import { ErreurDocument } from "@/lib/documents";
import { ErreurImport } from "@/lib/import/executer";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    throw new ApiError(401, "Authentification requise.");
  }
  return session;
}

export async function requirePermission(ressource: Ressource, action: Action) {
  const session = await requireSession();
  if (!peut(session.user.profil, ressource, action)) {
    throw new ApiError(403, "Action non autorisée pour ce profil.");
  }
  return session;
}

export function handleApiError(erreur: unknown) {
  if (erreur instanceof ApiError) {
    return NextResponse.json({ erreur: erreur.message }, { status: erreur.status });
  }
  if (erreur instanceof ZodError) {
    return NextResponse.json(
      { erreur: "Données invalides.", details: erreur.flatten() },
      { status: 400 },
    );
  }
  if (erreur instanceof ErreurPaiement) {
    const status = erreur.code === "PAIEMENT_INTROUVABLE" ? 404 : 400;
    return NextResponse.json({ erreur: erreur.message, code: erreur.code }, { status });
  }
  if (erreur instanceof ErreurDocument) {
    return NextResponse.json({ erreur: erreur.message, code: erreur.code }, { status: 400 });
  }
  if (erreur instanceof ErreurImport) {
    return NextResponse.json({ erreur: erreur.message, code: erreur.code }, { status: 400 });
  }
  console.error(erreur);
  return NextResponse.json({ erreur: "Erreur interne." }, { status: 500 });
}
