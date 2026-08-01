import { auth } from "@/lib/auth";
import {
  obtenirEvolutionCA,
  obtenirEvolutionImpayes,
  obtenirIndicateursFinanciers,
  obtenirIndicateursImmobiliers,
  obtenirIndicateursLocatifs,
  obtenirRepartitionBiens,
} from "@/lib/tableauDeBord";
import {
  GraphiqueEvolutionCA,
  GraphiqueEvolutionImpayes,
  GraphiqueOccupation,
  GraphiqueRepartitionBiens,
} from "@/components/tableau-de-bord/graphiques";

function CarteIndicateur({ libelle, valeur }: { libelle: string; valeur: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase text-slate-500">{libelle}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{valeur}</p>
    </div>
  );
}

// CDC §16.2, §16.9 : tableau de bord principal (indicateurs + graphiques).
export default async function PageAccueil() {
  const session = await auth();
  const maintenant = new Date();

  const [immobilier, financier, locatif, evolutionCA, repartitionBiens, evolutionImpayes] = await Promise.all([
    obtenirIndicateursImmobiliers(),
    obtenirIndicateursFinanciers(maintenant),
    obtenirIndicateursLocatifs(maintenant),
    obtenirEvolutionCA(maintenant),
    obtenirRepartitionBiens(),
    obtenirEvolutionImpayes(maintenant),
  ]);

  const donneesOccupation = [
    { statut: "Libre", total: immobilier.libres },
    { statut: "Occupé", total: immobilier.occupes },
    { statut: "En travaux", total: immobilier.travaux },
  ].filter((point) => point.total > 0);

  const fcfa = (valeur: number) => `${valeur.toLocaleString("fr-FR")} FCFA`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Bienvenue, {session?.user?.name}</h1>
        <p className="mt-1 text-sm text-slate-600">Vue d&apos;ensemble de l&apos;activité CIMEC.</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">Indicateurs immobiliers</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <CarteIndicateur libelle="Biens" valeur={immobilier.total} />
          <CarteIndicateur libelle="Occupés" valeur={immobilier.occupes} />
          <CarteIndicateur libelle="Libres" valeur={immobilier.libres} />
          <CarteIndicateur libelle="En travaux" valeur={immobilier.travaux} />
          <CarteIndicateur libelle="Taux d'occupation" valeur={`${immobilier.tauxOccupation}%`} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">Indicateurs financiers</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <CarteIndicateur libelle="Loyers attendus (mois)" valeur={fcfa(financier.loyersAttendus)} />
          <CarteIndicateur libelle="Loyers encaissés (mois)" valeur={fcfa(financier.loyersEncaisses)} />
          <CarteIndicateur libelle="Factures impayées" valeur={financier.facturesImpayees} />
          <CarteIndicateur libelle="Paiements partiels" valeur={financier.facturesPartielles} />
          <CarteIndicateur libelle="CA mensuel" valeur={fcfa(financier.caMensuel)} />
          <CarteIndicateur libelle="CA trimestriel" valeur={fcfa(financier.caTrimestriel)} />
          <CarteIndicateur libelle="CA annuel" valeur={fcfa(financier.caAnnuel)} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">Indicateurs locatifs</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <CarteIndicateur libelle="Locataires actifs" valeur={locatif.locatairesActifs} />
          <CarteIndicateur libelle="Nouveaux contrats (mois)" valeur={locatif.nouveauxContrats} />
          <CarteIndicateur libelle="Contrats à échéance (30j)" valeur={locatif.contratsAEcheance} />
          <CarteIndicateur libelle="Départs récents (mois)" valeur={locatif.departsRecents} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Évolution du chiffre d&apos;affaires</h3>
          <GraphiqueEvolutionCA donnees={evolutionCA} />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Occupation du patrimoine</h3>
          <GraphiqueOccupation donnees={donneesOccupation} />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Répartition des biens</h3>
          <GraphiqueRepartitionBiens donnees={repartitionBiens} />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Évolution des impayés</h3>
          <GraphiqueEvolutionImpayes donnees={evolutionImpayes} />
        </div>
      </section>
    </div>
  );
}
