# 11. Dictionnaire des données

Consolidation champ par champ du MLD (section 10), avec source CDC ou décision (D-XXX) pour chaque élément.

## 11.1 `communes`

| Champ | Type | Obligatoire | Défaut | Règle / contrainte | Source |
|---|---|---|---|---|---|
| id | UUID | Oui | auto | PK | D-029 |
| nom | VARCHAR(100) | Oui | — | UNIQUE | D-029 |

## 11.2 `quartiers`

| Champ | Type | Obligatoire | Défaut | Règle / contrainte | Source |
|---|---|---|---|---|---|
| id | UUID | Oui | auto | PK | D-029 |
| commune_id | UUID | Oui | — | FK → communes | D-029 |
| nom | VARCHAR(100) | Oui | — | UNIQUE (commune_id, nom) | D-029, CDC §1.1 |

## 11.3 `biens`

| Champ | Type | Obligatoire | Défaut | Règle / contrainte | Source |
|---|---|---|---|---|---|
| id | UUID | Oui | auto | PK | — |
| code | VARCHAR(30) | Oui | — | UNIQUE, auto ou manuel | CDC §5.1 (RG-B01) |
| type | VARCHAR(30) | Oui | — | Liste de valeurs §11.14 | CDC §1.1 (RG-B02) |
| designation | VARCHAR(150) | Oui | — | — | CDC §5.1 |
| description | TEXT | Non | — | — | CDC §5.1, §5.3 |
| quartier_id | UUID | Oui | — | FK → quartiers | CDC §5.3 |
| adresse | VARCHAR(255) | Oui | — | — | CDC §5.3 |
| loyer | NUMERIC(12,0) | Oui | — | ≥ 0, FCFA | CDC §5.1, §5.3 |
| charges_mensuelles | NUMERIC(12,0) | Non | 0 | FCFA | CDC §5.1, §5.3 |
| statut | VARCHAR(20) | Oui | libre | Liste de valeurs §11.14 | CDC §5.2 (RG-B03) |

## 11.4 `locataires`

| Champ | Type | Obligatoire | Défaut | Règle / contrainte | Source |
|---|---|---|---|---|---|
| id | UUID | Oui | auto | PK | — |
| code | VARCHAR(30) | Oui | — | UNIQUE | CDC §6.2 (RG-L02) |
| type | VARCHAR(20) | Oui | — | physique / entreprise | CDC §6.1 (RG-L01) |
| civilite | VARCHAR(10) | Si physique | — | — | CDC §6.1 |
| nom | VARCHAR(100) | Si physique | — | — | CDC §6.1 |
| prenoms | VARCHAR(150) | Si physique | — | — | CDC §6.1 |
| date_naissance | DATE | Si physique | — | — | CDC §6.1 |
| nationalite | VARCHAR(60) | Si physique | — | — | CDC §6.1 |
| profession | VARCHAR(100) | Si physique | — | — | CDC §6.1 |
| raison_sociale | VARCHAR(150) | Si entreprise | — | — | CDC §6.1 |
| infos_administratives | TEXT | Si entreprise | — | — | CDC §6.1 |
| representant | VARCHAR(150) | Si entreprise | — | — | CDC §6.1 |
| telephone_principal | VARCHAR(20) | Oui | — | — | CDC §6.2 |
| telephone_secondaire | VARCHAR(20) | Non | — | — | CDC §6.2 |
| email | VARCHAR(150) | Non | — | — | CDC §6.2 |
| contact_urgence | VARCHAR(150) | Non | — | — | CDC §6.2 |
| statut | VARCHAR(20) | Oui | actif | actif / archive | CDC §6.4 (RG-L04) |
| date_archivage | DATE | Non | — | Déclenche purge à +1 an | CDC §6.4 (RG-L04) |

## 11.5 `pieces_identite`

| Champ | Type | Obligatoire | Défaut | Règle / contrainte | Source |
|---|---|---|---|---|---|
| id | UUID | Oui | auto | PK | — |
| locataire_id | UUID | Oui | — | FK → locataires | CDC §6.3 (RG-L03) |
| type | VARCHAR(20) | Oui | — | Liste de valeurs §11.14 | CDC §6.3 |
| numero | VARCHAR(50) | Oui | — | — | CDC §6.3 |
| date_expiration | DATE | Non | — | — | CDC §6.3 |

## 11.6 `utilisateurs`

| Champ | Type | Obligatoire | Défaut | Règle / contrainte | Source |
|---|---|---|---|---|---|
| id | UUID | Oui | auto | PK | — |
| nom | VARCHAR(150) | Oui | — | — | CDC §13.1 |
| email | VARCHAR(150) | Oui | — | UNIQUE | CDC §13.1 |
| mot_de_passe_hash | VARCHAR(255) | Oui | — | Haché (jamais en clair) | CDC §18 (sécurité) |
| profil | VARCHAR(20) | Oui | — | Liste de valeurs §11.14, profil unique (D-014) | CDC §13.1 (RG-U01) |
| actif | BOOLEAN | Oui | true | — | CDC §13 |

## 11.7 `contrats`

| Champ | Type | Obligatoire | Défaut | Règle / contrainte | Source |
|---|---|---|---|---|---|
| id | UUID | Oui | auto | PK | — |
| numero | VARCHAR(30) | Oui | — | UNIQUE | CDC §7.2 (RG-C02) |
| bien_id | UUID | Oui | — | FK → biens | CDC §7.2 (RG-C01) |
| locataire_id | UUID | Oui | — | FK → locataires | CDC §7.2 (RG-C01) |
| date_debut | DATE | Oui | — | — | CDC §7.2 |
| date_fin | DATE | Oui | — | Durée standard 1 an | CDC §7.2, §7.3 (RG-C04) |
| montant_loyer | NUMERIC(12,0) | Oui | — | FCFA | CDC §7.2 |
| charges | NUMERIC(12,0) | Non | 0 | FCFA | CDC §7.2 |
| montant_caution | NUMERIC(12,0) | Oui | 2 mois de loyer (proposé) | Modifiable par contrat | CDC §11.1, D-016 (RG-K04) |
| avance_loyer | NUMERIC(12,0) | Non | 0 | FCFA | CDC §7.2 |
| periodicite | VARCHAR(20) | Oui | — | Liste de valeurs §11.14 | CDC §7.2, §8.4 (RG-F03) |
| statut | VARCHAR(20) | Oui | brouillon | Liste de valeurs §11.14 | CDC §7.2 (RG-C03) |
| valide_par | UUID | Non | — | FK → utilisateurs, doit être profil Gérant | CDC §7.4, §14 (RG-C05) |
| date_validation | TIMESTAMPTZ | Non | — | — | CDC §7.4 |
| contrat_parent_id | UUID | Non | — | FK → contrats (renouvellement) | CDC §7.3, §17.7 (RG-C04) |
| — | — | — | — | UNIQUE (bien_id) WHERE statut='actif' | Section 09 (règle de gestion) |
| — | — | — | — | Pas de prorata premier mois (mois plein) | D-015 (RG-F06) |

## 11.8 `revisions_loyer`

| Champ | Type | Obligatoire | Défaut | Règle / contrainte | Source |
|---|---|---|---|---|---|
| id | UUID | Oui | auto | PK | — |
| contrat_id | UUID | Oui | — | FK → contrats | CDC §7.6 (RG-C07) |
| ancien_montant | NUMERIC(12,0) | Oui | — | FCFA | CDC §7.6 |
| nouveau_montant | NUMERIC(12,0) | Oui | — | FCFA | CDC §7.6 |
| date_modification | DATE | Oui | — | — | CDC §7.6 |
| motif | TEXT | Oui | — | — | CDC §7.6 |
| demande_par | UUID | Oui | — | FK → utilisateurs | CDC §7.6 |
| valide_par | UUID | Non | — | FK → utilisateurs, doit être profil Gérant | CDC §7.6, §14 |

## 11.9 `cautions`

| Champ | Type | Obligatoire | Défaut | Règle / contrainte | Source |
|---|---|---|---|---|---|
| id | UUID | Oui | auto | PK | — |
| contrat_id | UUID | Oui | — | FK → contrats, UNIQUE (1-1) | CDC §11.1, §11.2 (RG-K01) |
| montant_initial | NUMERIC(12,0) | Oui | — | FCFA | CDC §11.1 |
| date_versement | DATE | Oui | — | — | CDC §11.2 |
| statut | VARCHAR(30) | Oui | detenue | Liste de valeurs §11.14 | CDC §11.3 (RG-K02) |
| montant_retenu | NUMERIC(12,0) | Non | 0 | FCFA | CDC §11.3, §11.4 |
| motif_retenue | TEXT | Non | — | Requis si retenue | CDC §11.3 |
| montant_rembourse | NUMERIC(12,0) | Non | — | FCFA | CDC §11.3 |
| date_remboursement | DATE | Non | — | Aucun délai imposé | CDC §11.4, D-017 (RG-K05) |
| valide_par | UUID | Non | — | FK → utilisateurs, doit être profil Gérant | CDC §11.4, §14 (RG-K03) |

## 11.10 `factures`

| Champ | Type | Obligatoire | Défaut | Règle / contrainte | Source |
|---|---|---|---|---|---|
| id | UUID | Oui | auto | PK | — |
| numero | VARCHAR(30) | Oui | — | UNIQUE | CDC §8.3 (RG-F02) |
| contrat_id | UUID | Oui | — | FK → contrats | CDC §8.1 |
| date_emission | DATE | Oui | — | Générée le 25 du mois | CDC §8.1 (RG-F01) |
| periode | VARCHAR(20) | Oui | — | Mois ou trimestre/année facturé | CDC §8.3 |
| montant_loyer | NUMERIC(12,0) | Oui | — | FCFA | CDC §8.3 |
| charges | NUMERIC(12,0) | Non | 0 | FCFA | CDC §8.3 |
| arrieres | NUMERIC(12,0) | Non | 0 | FCFA | CDC §8.3 |
| total_a_payer | NUMERIC(12,0) | Oui | — | FCFA | CDC §8.3 |
| montant_paye | NUMERIC(12,0) | Non | 0 | FCFA | CDC §8.3 |
| solde_restant | NUMERIC(12,0) | Oui | — | FCFA | CDC §8.3 |
| statut | VARCHAR(20) | Oui | emise | Liste de valeurs §11.14 | CDC §8.3, §9.2 |
| date_echeance | DATE | Oui | — | Avant le 10 du mois | CDC §17.5, D-020 (RG-F05) |
| alerte_echeance_envoyee | BOOLEAN | Oui | false | Idempotence de l'alerte échéance | Sprint 6, D-026/D-027 (RG-N04) |
| relance_impaye_envoyee | BOOLEAN | Oui | false | Idempotence de la relance impayé | Sprint 6, D-026/D-027 (RG-N04) |

## 11.11 `paiements`

| Champ | Type | Obligatoire | Défaut | Règle / contrainte | Source |
|---|---|---|---|---|---|
| id | UUID | Oui | auto | PK | — |
| reference | VARCHAR(30) | Oui | — | UNIQUE | CDC §9.4 (RG-P03) |
| facture_id | UUID | Oui | — | FK → factures | CDC §9.2 (RG-P01) |
| date_paiement | DATE | Oui | — | — | CDC §9.4 |
| montant | NUMERIC(12,0) | Oui | — | > 0, FCFA | CDC §9.2 |
| mode | VARCHAR(20) | Oui | — | Liste de valeurs §11.14 | CDC §9.3 (RG-P02) |
| encaisse_par | UUID | Oui | — | FK → utilisateurs | CDC §9.4 |
| statut | VARCHAR(20) | Oui | valide | Liste de valeurs §11.14 ; correction requiert validation Gérant | CDC §14 (RG-P04) |

## 11.12 `quittances`

| Champ | Type | Obligatoire | Défaut | Règle / contrainte | Source |
|---|---|---|---|---|---|
| id | UUID | Oui | auto | PK | — |
| numero | VARCHAR(30) | Oui | — | UNIQUE | CDC §10, D-030 |
| paiement_id | UUID | Oui | — | FK → paiements, UNIQUE (1-1) | CDC §10 (RG-P05) |
| date | DATE | Oui | — | — | CDC §10 |
| lien_pdf | VARCHAR(255) | Non | — | — | CDC §10 |

## 11.13 `documents`

| Champ | Type | Obligatoire | Défaut | Règle / contrainte | Source |
|---|---|---|---|---|---|
| id | UUID | Oui | auto | PK | — |
| type_document | VARCHAR(50) | Oui | — | — | CDC §12.2 (RG-D02) |
| reference | VARCHAR(150) | Oui | — | — | CDC §12.1 (RG-D01) |
| lien_securise | VARCHAR(500) | Oui | — | Lien Google Drive | CDC §12.1, CLAUDE.md |
| entite_type | VARCHAR(20) | Oui | — | bien / locataire / contrat / facture | CDC §12.2, Section 09 |
| entite_id | UUID | Oui | — | Résolu selon entite_type | Section 09 |
| date_ajout | TIMESTAMPTZ | Oui | now() | — | CDC §12.1 |
| ajoute_par | UUID | Oui | — | FK → utilisateurs | CDC §12.1 |

## 11.14 `notifications`

| Champ | Type | Obligatoire | Défaut | Règle / contrainte | Source |
|---|---|---|---|---|---|
| id | UUID | Oui | auto | PK | — |
| utilisateur_id | UUID | Oui | — | FK → utilisateurs | CDC §17.2 (RG-N01) |
| type | VARCHAR(20) | Oui | — | information / alerte / action_requise | CDC §17.2 |
| titre | VARCHAR(150) | Oui | — | — | CDC §17.2 |
| message | TEXT | Oui | — | — | CDC §17.2 |
| canal | VARCHAR(20) | Non | — | interne / email / sms / whatsapp | D-026, D-027 |
| lue | BOOLEAN | Oui | false | — | CDC §17.2 |
| date | TIMESTAMPTZ | Oui | now() | — | CDC §17.2 |

## 11.15 `audits`

| Champ | Type | Obligatoire | Défaut | Règle / contrainte | Source |
|---|---|---|---|---|---|
| id | UUID | Oui | auto | PK | — |
| utilisateur_id | UUID | Oui | — | FK → utilisateurs | CDC §15 (RG-U03) |
| date_heure | TIMESTAMPTZ | Oui | now() | — | CDC §15 |
| action | VARCHAR(100) | Oui | — | ex. modification loyer, suppression, validation, remboursement | CDC §15 |
| entite_type | VARCHAR(30) | Oui | — | — | CDC §15 |
| entite_id | UUID | Oui | — | — | CDC §15 |
| ancienne_valeur | JSONB | Non | — | — | CDC §15 |
| nouvelle_valeur | JSONB | Non | — | — | CDC §15 |

## 11.16 Listes de valeurs

| Domaine | Valeurs | Source |
|---|---|---|
| `biens.type` | maison, villa, appartement, studio, chambre, bureau, magasin, entrepot, terrain, immeuble, local_commercial | CDC §1.1 |
| `biens.statut` | libre, occupe, en_travaux | CDC §5.2 |
| `locataires.type` | physique, entreprise | CDC §6.1 |
| `locataires.statut` | actif, archive | CDC §6.4 |
| `pieces_identite.type` | passeport, cni, carte_consulaire, permis | CDC §6.3 |
| `contrats.periodicite` | mensuelle, trimestrielle, annuelle | CDC §7.2 |
| `contrats.statut` | brouillon, actif, resilie, termine | CDC §7.2 |
| `cautions.statut` | detenue, remboursee, remboursee_avec_retenue | CDC §11.3 |
| `factures.statut` | emise, partiellement_payee, payee, impayee | CDC §8.3, §9.2 |
| `paiements.mode` | especes, virement, cheque, orange_money, mtn_money, moov_money, wave | CDC §9.3 |
| `paiements.statut` | valide, corrige, annule | CDC §14 |
| `documents.entite_type` | bien, locataire, contrat, facture | CDC §12.2 |
| `utilisateurs.profil` | administrateur, gerant, gestionnaire, consultation | CDC §13.1 |
| `notifications.type` | information, alerte, action_requise | CDC §17.2 |
| `notifications.canal` | interne, email, sms, whatsapp | D-026, D-027 |
