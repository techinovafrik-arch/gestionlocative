"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Palette validée (skill dataviz) : slot 1 bleu, slot 2 orange — cohérente
// avec la charte bleu/orange de l'application (D-032).
const COULEUR_SERIE_1 = "#2a78d6";
const COULEUR_SERIE_2 = "#eb6834";
const COULEUR_TEXTE_SECONDAIRE = "#52514e";

const COULEURS_STATUT_BIEN: Record<string, string> = {
  Libre: "#10b981",
  Occupé: "#2a78d6",
  "En travaux": "#eb6834",
};

const COULEURS_CATEGORIES = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#4a3aa7"];

function formaterFcfaCourt(valeur: number): string {
  if (valeur >= 1_000_000) return `${(valeur / 1_000_000).toFixed(1)}M`;
  if (valeur >= 1_000) return `${Math.round(valeur / 1_000)}k`;
  return `${valeur}`;
}

export function GraphiqueEvolutionCA({ donnees }: { donnees: { mois: string; montant: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={donnees} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e0" vertical={false} />
        <XAxis dataKey="mois" fontSize={12} stroke={COULEUR_TEXTE_SECONDAIRE} />
        <YAxis fontSize={12} stroke={COULEUR_TEXTE_SECONDAIRE} tickFormatter={formaterFcfaCourt} width={40} />
        <Tooltip formatter={(valeur) => `${Number(valeur ?? 0).toLocaleString("fr-FR")} FCFA`} />
        <Line
          type="monotone"
          dataKey="montant"
          stroke={COULEUR_SERIE_1}
          strokeWidth={2}
          dot={{ r: 3 }}
          name="Chiffre d'affaires"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function GraphiqueOccupation({
  donnees,
}: {
  donnees: { statut: string; total: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={donnees} dataKey="total" nameKey="statut" innerRadius={50} outerRadius={80} paddingAngle={2}>
          {donnees.map((entree) => (
            <Cell key={entree.statut} fill={COULEURS_STATUT_BIEN[entree.statut] ?? "#9ca3af"} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function GraphiqueRepartitionBiens({
  donnees,
}: {
  donnees: { categorie: string; total: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={donnees} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e0" vertical={false} />
        <XAxis dataKey="categorie" fontSize={12} stroke={COULEUR_TEXTE_SECONDAIRE} />
        <YAxis fontSize={12} stroke={COULEUR_TEXTE_SECONDAIRE} allowDecimals={false} width={30} />
        <Tooltip />
        <Bar dataKey="total" name="Biens" radius={[4, 4, 0, 0]}>
          {donnees.map((entree, index) => (
            <Cell key={entree.categorie} fill={COULEURS_CATEGORIES[index % COULEURS_CATEGORIES.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Deux mesures d'échelles différentes (montant, nombre de clients) : deux
// graphiques distincts plutôt qu'un double axe (anti-pattern dataviz).
export function GraphiqueEvolutionImpayes({
  donnees,
}: {
  donnees: { mois: string; montant: number; clients: number }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="mb-1 text-xs font-medium text-slate-600">Montant impayé (FCFA)</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={donnees} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e0" vertical={false} />
            <XAxis dataKey="mois" fontSize={11} stroke={COULEUR_TEXTE_SECONDAIRE} />
            <YAxis fontSize={11} stroke={COULEUR_TEXTE_SECONDAIRE} tickFormatter={formaterFcfaCourt} width={40} />
            <Tooltip formatter={(valeur) => `${Number(valeur ?? 0).toLocaleString("fr-FR")} FCFA`} />
            <Line type="monotone" dataKey="montant" stroke={COULEUR_SERIE_2} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <p className="mb-1 text-xs font-medium text-slate-600">Clients concernés</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={donnees} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e0" vertical={false} />
            <XAxis dataKey="mois" fontSize={11} stroke={COULEUR_TEXTE_SECONDAIRE} />
            <YAxis fontSize={11} stroke={COULEUR_TEXTE_SECONDAIRE} allowDecimals={false} width={30} />
            <Tooltip />
            <Bar dataKey="clients" fill={COULEUR_SERIE_2} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
