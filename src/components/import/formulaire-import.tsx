"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ErreurLigne = { feuille: string; ligne: number; message: string };
type Resume = { biens: number; locataires: number; contrats: number };

export function FormulaireImport() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [enCours, setEnCours] = useState<"analyse" | "import" | null>(null);
  const [erreurGenerale, setErreurGenerale] = useState<string | null>(null);
  const [erreursLignes, setErreursLignes] = useState<ErreurLigne[]>([]);
  const [resumeAnalyse, setResumeAnalyse] = useState<Resume | null>(null);
  const [resultatImport, setResultatImport] = useState<Resume | null>(null);

  function reinitialiserResultats() {
    setErreurGenerale(null);
    setErreursLignes([]);
    setResumeAnalyse(null);
    setResultatImport(null);
  }

  async function analyser() {
    const fichier = inputRef.current?.files?.[0];
    if (!fichier) {
      setErreurGenerale("Sélectionnez un fichier .xlsx à analyser.");
      return;
    }

    reinitialiserResultats();
    setEnCours("analyse");

    const formData = new FormData();
    formData.append("fichier", fichier);

    const reponse = await fetch("/api/import/analyser", { method: "POST", body: formData });
    const donnees = await reponse.json().catch(() => null);
    setEnCours(null);

    if (!reponse.ok) {
      setErreurGenerale(donnees?.erreur ?? "Une erreur est survenue lors de l'analyse.");
      return;
    }

    setErreursLignes(donnees.erreurs ?? []);
    setResumeAnalyse(donnees.resume ?? null);
  }

  async function confirmerImport() {
    const fichier = inputRef.current?.files?.[0];
    if (!fichier) {
      setErreurGenerale("Sélectionnez un fichier .xlsx à importer.");
      return;
    }

    setEnCours("import");
    setErreurGenerale(null);

    const formData = new FormData();
    formData.append("fichier", fichier);

    const reponse = await fetch("/api/import/executer", { method: "POST", body: formData });
    const donnees = await reponse.json().catch(() => null);
    setEnCours(null);

    if (!reponse.ok) {
      setErreurGenerale(donnees?.erreur ?? "Une erreur est survenue lors de l'import.");
      setErreursLignes(donnees?.erreurs ?? []);
      return;
    }

    setResultatImport(donnees.resume);
    setResumeAnalyse(null);
    router.refresh();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <a
        href="/api/import/modele"
        className="inline-block rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        Télécharger le modèle Excel
      </a>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <label className="block text-sm font-medium text-slate-700">Classeur rempli (.xlsx)</label>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          onChange={reinitialiserResultats}
          className="mt-2 block w-full text-sm"
        />

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={analyser}
            disabled={enCours !== null}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            {enCours === "analyse" ? "Analyse en cours..." : "Analyser"}
          </button>

          {resumeAnalyse && erreursLignes.length === 0 && (
            <button
              type="button"
              onClick={confirmerImport}
              disabled={enCours !== null}
              className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
            >
              {enCours === "import" ? "Import en cours..." : "Confirmer l'import"}
            </button>
          )}
        </div>
      </div>

      {erreurGenerale && <p className="text-sm text-red-600">{erreurGenerale}</p>}

      {resumeAnalyse && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-900">Aperçu de l&apos;analyse</p>
          <p className="mt-1 text-sm text-slate-600">
            {resumeAnalyse.biens} bien(s) · {resumeAnalyse.locataires} locataire(s) · {resumeAnalyse.contrats} contrat(s) valide(s).
          </p>
          {erreursLignes.length === 0 ? (
            <p className="mt-2 text-sm font-medium text-emerald-700">
              Aucune erreur détectée — vous pouvez confirmer l&apos;import.
            </p>
          ) : (
            <p className="mt-2 text-sm font-medium text-red-700">
              {erreursLignes.length} erreur(s) à corriger avant import.
            </p>
          )}
        </div>
      )}

      {erreursLignes.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3">Feuille</th>
                <th className="px-4 py-3">Ligne</th>
                <th className="px-4 py-3">Erreur</th>
              </tr>
            </thead>
            <tbody>
              {erreursLignes.map((erreur, index) => (
                <tr key={index} className="border-t border-slate-100">
                  <td className="px-4 py-3">{erreur.feuille}</td>
                  <td className="px-4 py-3">{erreur.ligne || "—"}</td>
                  <td className="px-4 py-3">{erreur.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {resultatImport && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-800">Import terminé avec succès.</p>
          <p className="mt-1 text-sm text-emerald-700">
            {resultatImport.biens} bien(s), {resultatImport.locataires} locataire(s) et{" "}
            {resultatImport.contrats} contrat(s) créés.
          </p>
        </div>
      )}
    </div>
  );
}
