# 13. États et rapports

## 13.1 Principes généraux

Tous les rapports sont : consultables en ligne, exportables en PDF et Excel, imprimables directement (RG-X02, CDC §16.1). Aucune mention RCCM/NCC sur les documents ; TVA non appliquée aux loyers (D-034).

## 13.2 Tableau de bord principal

### Indicateurs immobiliers
Nombre total de biens, nombre de biens occupés, nombre de biens libres, nombre de biens en travaux, taux d'occupation du patrimoine.

### Indicateurs financiers
Loyers attendus du mois, loyers encaissés, factures impayées, paiements partiels, chiffre d'affaires mensuel/trimestriel/annuel.

### Indicateurs locatifs
Nombre de locataires actifs, nouveaux contrats, contrats arrivant à échéance, départs récents.

*(CDC §16.2)*

## 13.3 Graphiques obligatoires

| Graphique | Contenu |
|---|---|
| Évolution du chiffre d'affaires | Mensuelle, trimestrielle, annuelle |
| Occupation du patrimoine | Répartition Occupés / Libres / En travaux |
| Répartition des biens | Par catégorie (appartement, villa, maison, bureau, magasin, autres) |
| Évolution des impayés | Nombre de clients concernés, montant total, évolution mensuelle |

*(CDC §16.9)*

## 13.4 Fiches des rapports

### Rapports immobiliers (CDC §16.3)

| Rapport | Contenu | Filtres | Profils |
|---|---|---|---|
| Liste des biens | Code, type, désignation, localisation, loyer, charges, statut | Type, quartier, disponibilité | Administrateur, Gérant, Gestionnaire, Consultation |
| Biens disponibles | Code, type, quartier, date de disponibilité, durée de vacance | — | Administrateur, Gérant, Gestionnaire, Consultation |
| Biens occupés | Bien, locataire, contrat actif, loyer, date début occupation | — | Administrateur, Gérant, Gestionnaire, Consultation |
| Historique des occupations | Locataires successifs, dates d'entrée/sortie, contrats associés | Par bien | Administrateur, Gérant, Gestionnaire, Consultation |

### Rapports locataires (CDC §16.4)

| Rapport | Contenu | Profils |
|---|---|---|
| Liste des locataires actifs | Code, nom, téléphone, bien occupé, date contrat | Administrateur, Gérant, Gestionnaire, Consultation |
| Historique locataire | Anciens logements, contrats, paiements, incidents financiers | Administrateur, Gérant, Gestionnaire, Consultation |

### Rapports contrats (CDC §16.5)

| Rapport | Contenu | Filtres | Profils |
|---|---|---|---|
| Contrats arrivant à échéance | Numéro, locataire, bien, date expiration, statut renouvellement | 30 / 60 / 90 jours | Administrateur, Gérant, Gestionnaire, Consultation |

### Rapports financiers (CDC §16.6)

| Rapport | Contenu | Profils |
|---|---|---|
| Factures émises | Numéro, date, locataire, montant, statut paiement | Administrateur, Gérant, Consultation |
| Factures impayées | Locataire, bien, montant dû, date échéance, jours de retard | Administrateur, Gérant, Gestionnaire, Consultation |
| Factures partiellement payées | Montant initial, montant payé, solde restant | Administrateur, Gérant, Gestionnaire, Consultation |
| Journal des encaissements | Date, locataire, montant, mode paiement, agent | Administrateur, Gérant, Consultation |
| Relevé des paiements d'un locataire | Historique des règlements, factures associées, soldes | Administrateur, Gérant, Consultation |

### Rapports cautions (CDC §16.7)

| Rapport | Contenu | Profils |
|---|---|---|
| État des cautions | Catégories (détenues, remboursées, avec retenue) ; locataire, contrat, montant initial, retenue, montant remboursé | Administrateur, Gérant, Consultation |

### Rapports financiers de synthèse (CDC §16.8)

| Rapport | Contenu | Profils |
|---|---|---|
| Tableau des loyers attendus | Montant attendu par période (mois, trimestre, année) | Administrateur, Gérant |
| Tableau des loyers encaissés | Prévision / réalisation / écart | Administrateur, Gérant |
| Balance des impayés | Locataire, montant dû, retard (jours) | Administrateur, Gérant |

## 13.5 Documents PDF

### Contrat de bail (RG-C06, D-035)

Deux trames sont proposées, conformes au droit ivoirien du bail :
- **Bail habitation** — pour les locataires personnes physiques.
- **Bail commercial** — pour les locataires entreprises.

Structure commune (CDC §7.5) :

```
┌────────────────────────────────────────┐
│ [Logo CIMEC]      CISSE MEDOUNE (CIMEC) │
│           Treichville Zone III, Abidjan │
│         Tél. +225 01 03 98 95 50        │
├────────────────────────────────────────┤
│      CONTRAT DE BAIL [HABITATION /      │
│              COMMERCIAL]                │
│                                          │
│  Entre les soussignés :                 │
│  Le Bailleur : CIMEC ...                │
│  Le Locataire : [Nom / Raison sociale]  │
│                                          │
│  Désignation du bien : [bien]           │
│  Conditions financières : loyer,        │
│    charges, caution, avance             │
│  Durée : du [date_debut] au [date_fin]  │
│    renouvelable par tacite reconduction │
│                                          │
│  Clauses principales : [liste]          │
│                                          │
│  Fait à Abidjan, le [date]              │
│                                          │
│  Signature Bailleur    Signature        │
│  ______________        Locataire        │
│                         ______________   │
└────────────────────────────────────────┘
```

### Facture (RG-F02, CDC §8.3)

```
┌────────────────────────────────────────┐
│ [Logo CIMEC]        FACTURE N° [xxxx]   │
│                      Date : [date]      │
├────────────────────────────────────────┤
│ Locataire : [nom]                       │
│ Bien : [désignation]                    │
│ Période : [mois / trimestre / année]    │
├────────────────────────────────────────┤
│ Loyer                    [montant]      │
│ Charges                  [montant]      │
│ Arriérés                 [montant]      │
│ ─────────────────────────────────────  │
│ Total à payer             [montant]      │
│ Montant payé               [montant]     │
│ Solde restant               [montant]    │
└────────────────────────────────────────┘
```
Pas de mention RCCM/NCC/TVA (D-034).

### Quittance (RG-P05, CDC §10)

```
┌────────────────────────────────────────┐
│ [Logo CIMEC]      QUITTANCE N° [xxxx]   │
│                    Date : [date]        │
├────────────────────────────────────────┤
│ Locataire : [nom]                       │
│ Bien : [désignation]                    │
│ Période : [période concernée]           │
│ Montant payé : [montant] FCFA           │
│ Mode de paiement : [mode]               │
└────────────────────────────────────────┘
```
