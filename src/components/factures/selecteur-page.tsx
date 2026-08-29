"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

// Liste déroulante de navigation entre les pages de la zone « Factures
// impayées » (D-045) — 10 lignes par page.
export function SelecteurPage({ nombrePages, pageCourante }: { nombrePages: number; pageCourante: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function allerA(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}#factures-impayees`);
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        type="button"
        onClick={() => allerA(pageCourante - 1)}
        disabled={pageCourante <= 1}
        className="rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-100 disabled:opacity-40"
      >
        Précédent
      </button>
      <label className="flex items-center gap-1">
        Page
        <select
          value={pageCourante}
          onChange={(e) => allerA(Number(e.target.value))}
          className="rounded-md border border-slate-300 px-2 py-1"
        >
          {Array.from({ length: nombrePages }, (_, i) => i + 1).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        / {nombrePages}
      </label>
      <button
        type="button"
        onClick={() => allerA(pageCourante + 1)}
        disabled={pageCourante >= nombrePages}
        className="rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-100 disabled:opacity-40"
      >
        Suivant
      </button>
    </div>
  );
}
