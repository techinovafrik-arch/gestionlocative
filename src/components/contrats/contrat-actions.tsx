"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function useActionApi() {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function appeler(url: string, corps?: unknown) {
    setErreur(null);
    setEnCours(true);
    const reponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: corps ? JSON.stringify(corps) : undefined,
    });
    setEnCours(false);

    if (!reponse.ok) {
      const donnees = await reponse.json().catch(() => null);
      setErreur(donnees?.erreur ?? "Une erreur est survenue.");
      return false;
    }

    router.refresh();
    return true;
  }

  return { appeler, erreur, enCours };
}

// UC-03 : validation/activation du contrat par le gérant.
export function BoutonValiderContrat({ contratId }: { contratId: string }) {
  const { appeler, erreur, enCours } = useActionApi();

  return (
    <div>
      <button
        onClick={() => appeler(`/api/contrats/${contratId}/valider`)}
        disabled={enCours}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {enCours ? "Validation..." : "Valider et activer le contrat"}
      </button>
      {erreur && <p className="mt-2 text-sm text-red-600">{erreur}</p>}
    </div>
  );
}

// RG-C07 : proposition de révision de loyer.
export function FormulaireRevisionLoyer({ contratId }: { contratId: string }) {
  const { appeler, erreur, enCours } = useActionApi();

  async function onSubmit(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const f = new FormData(evenement.currentTarget);
    const ok = await appeler(`/api/contrats/${contratId}/revisions`, {
      nouveauMontant: Number(f.get("nouveauMontant")),
      motif: f.get("motif"),
    });
    if (ok) evenement.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-md border border-slate-200 p-4">
      <p className="text-sm font-medium text-slate-700">Proposer une révision de loyer</p>
      <div className="grid grid-cols-2 gap-3">
        <input
          name="nouveauMontant"
          type="number"
          min={0}
          required
          placeholder="Nouveau montant (FCFA)"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="motif"
          required
          placeholder="Motif"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      {erreur && <p className="text-sm text-red-600">{erreur}</p>}
      <button
        type="submit"
        disabled={enCours}
        className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
      >
        {enCours ? "Envoi..." : "Proposer la révision"}
      </button>
    </form>
  );
}

// RG-C07 : validation de la révision par le gérant.
export function BoutonValiderRevision({
  contratId,
  revisionId,
}: {
  contratId: string;
  revisionId: string;
}) {
  const { appeler, erreur, enCours } = useActionApi();

  return (
    <div>
      <button
        onClick={() => appeler(`/api/contrats/${contratId}/revisions/${revisionId}/valider`)}
        disabled={enCours}
        className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {enCours ? "Validation..." : "Valider"}
      </button>
      {erreur && <p className="mt-1 text-xs text-red-600">{erreur}</p>}
    </div>
  );
}

// UC-08, P6 : clôture du contrat par le gestionnaire.
export function FormulaireCloture({ contratId }: { contratId: string }) {
  const { appeler, erreur, enCours } = useActionApi();

  async function onSubmit(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const f = new FormData(evenement.currentTarget);
    await appeler(`/api/contrats/${contratId}/cloturer`, {
      typeCloture: f.get("typeCloture"),
      motifRetenue: f.get("motifRetenue") || undefined,
      montantRetenuPropose: f.get("montantRetenuPropose")
        ? Number(f.get("montantRetenuPropose"))
        : undefined,
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-md border border-slate-200 p-4">
      <p className="text-sm font-medium text-slate-700">Clôturer le contrat</p>
      <select
        name="typeCloture"
        required
        defaultValue="termine"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="termine">Fin de contrat normale</option>
        <option value="resilie">Résiliation anticipée</option>
      </select>
      <p className="text-xs text-slate-500">
        Motif de retenue éventuelle sur la caution (proposition — décision finale par le gérant) :
      </p>
      <div className="grid grid-cols-2 gap-3">
        <input
          name="montantRetenuPropose"
          type="number"
          min={0}
          placeholder="Montant proposé (FCFA)"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="motifRetenue"
          placeholder="Motif (dommages, réparations...)"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      {erreur && <p className="text-sm text-red-600">{erreur}</p>}
      <button
        type="submit"
        disabled={enCours}
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        {enCours ? "Clôture..." : "Clôturer le contrat"}
      </button>
    </form>
  );
}

// RG-K02, RG-K03 : décision du gérant sur le sort de la caution.
export function FormulaireDecisionCaution({ cautionId }: { cautionId: string }) {
  const { appeler, erreur, enCours } = useActionApi();
  const [decision, setDecision] = useState<"remboursement_integral" | "retenue">(
    "remboursement_integral",
  );

  async function onSubmit(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const f = new FormData(evenement.currentTarget);
    await appeler(`/api/cautions/${cautionId}/valider`, {
      decision,
      montantRetenu: f.get("montantRetenu") ? Number(f.get("montantRetenu")) : undefined,
      motifRetenue: f.get("motifRetenue") || undefined,
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-md border border-slate-200 p-4">
      <p className="text-sm font-medium text-slate-700">Décision sur la caution</p>
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={decision === "remboursement_integral"}
            onChange={() => setDecision("remboursement_integral")}
          />
          Remboursement intégral
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={decision === "retenue"}
            onChange={() => setDecision("retenue")}
          />
          Retenue
        </label>
      </div>
      {decision === "retenue" && (
        <div className="grid grid-cols-2 gap-3">
          <input
            name="montantRetenu"
            type="number"
            min={0}
            required
            placeholder="Montant retenu (FCFA)"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="motifRetenue"
            required
            placeholder="Motif"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      )}
      {erreur && <p className="text-sm text-red-600">{erreur}</p>}
      <button
        type="submit"
        disabled={enCours}
        className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
      >
        {enCours ? "Validation..." : "Valider la décision"}
      </button>
    </form>
  );
}
