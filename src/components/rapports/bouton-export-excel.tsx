export function BoutonExportExcel({ type, parametres }: { type: string; parametres?: Record<string, string> }) {
  const params = new URLSearchParams({ type, ...(parametres ?? {}) });

  return (
    <a
      href={`/api/rapports/excel?${params.toString()}`}
      className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
    >
      Exporter en Excel
    </a>
  );
}
