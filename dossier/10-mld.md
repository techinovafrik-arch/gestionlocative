# 10. Modèle logique de données (MLD)

## Conventions (D-031)

- Tables en `snake_case`, au pluriel.
- Clé primaire `id` de type `UUID` (défaut `gen_random_uuid()`).
- `created_at` / `updated_at` (`TIMESTAMPTZ`) sur toutes les tables.
- Montants en `NUMERIC(12,0)` (FCFA, sans décimales).
- Suppression logique via colonne de statut/archivage — pas de `DELETE` physique sur `locataires`, `contrats`, `factures`, `paiements`, `cautions`.
- Un seul contrat « actif » par bien : index unique partiel.

## 10.1 Schéma relationnel

### `communes`
| Colonne | Type | Contrainte |
|---|---|---|
| id | UUID | PK |
| nom | VARCHAR(100) | NOT NULL, UNIQUE |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |

### `quartiers`
| Colonne | Type | Contrainte |
|---|---|---|
| id | UUID | PK |
| commune_id | UUID | NOT NULL, FK → communes(id) |
| nom | VARCHAR(100) | NOT NULL |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |
| | | UNIQUE (commune_id, nom) |

### `biens`
| Colonne | Type | Contrainte |
|---|---|---|
| id | UUID | PK |
| code | VARCHAR(30) | NOT NULL, UNIQUE |
| type | VARCHAR(30) | NOT NULL, CHECK ∈ {maison, villa, appartement, studio, chambre, bureau, magasin, entrepot, terrain, immeuble, local_commercial} |
| designation | VARCHAR(150) | NOT NULL |
| description | TEXT | |
| quartier_id | UUID | NOT NULL, FK → quartiers(id) |
| adresse | VARCHAR(255) | NOT NULL |
| loyer | NUMERIC(12,0) | NOT NULL, CHECK (loyer >= 0) |
| charges_mensuelles | NUMERIC(12,0) | NOT NULL DEFAULT 0 |
| statut | VARCHAR(20) | NOT NULL DEFAULT 'libre', CHECK ∈ {libre, occupe, en_travaux} |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |

### `locataires`
| Colonne | Type | Contrainte |
|---|---|---|
| id | UUID | PK |
| code | VARCHAR(30) | NOT NULL, UNIQUE |
| type | VARCHAR(20) | NOT NULL, CHECK ∈ {physique, entreprise} |
| civilite | VARCHAR(10) | |
| nom | VARCHAR(100) | |
| prenoms | VARCHAR(150) | |
| date_naissance | DATE | |
| nationalite | VARCHAR(60) | |
| profession | VARCHAR(100) | |
| raison_sociale | VARCHAR(150) | |
| infos_administratives | TEXT | |
| representant | VARCHAR(150) | |
| telephone_principal | VARCHAR(20) | NOT NULL |
| telephone_secondaire | VARCHAR(20) | |
| email | VARCHAR(150) | |
| contact_urgence | VARCHAR(150) | |
| statut | VARCHAR(20) | NOT NULL DEFAULT 'actif', CHECK ∈ {actif, archive} |
| date_archivage | DATE | |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |
| | | CHECK cohérence type physique/entreprise (contrôle applicatif) |

### `pieces_identite`
| Colonne | Type | Contrainte |
|---|---|---|
| id | UUID | PK |
| locataire_id | UUID | NOT NULL, FK → locataires(id) |
| type | VARCHAR(20) | NOT NULL, CHECK ∈ {passeport, cni, carte_consulaire, permis} |
| numero | VARCHAR(50) | NOT NULL |
| date_expiration | DATE | |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |

### `utilisateurs`
| Colonne | Type | Contrainte |
|---|---|---|
| id | UUID | PK |
| nom | VARCHAR(150) | NOT NULL |
| email | VARCHAR(150) | NOT NULL, UNIQUE |
| mot_de_passe_hash | VARCHAR(255) | NOT NULL |
| profil | VARCHAR(20) | NOT NULL, CHECK ∈ {administrateur, gerant, gestionnaire, consultation} |
| actif | BOOLEAN | NOT NULL DEFAULT true |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |

### `contrats`
| Colonne | Type | Contrainte |
|---|---|---|
| id | UUID | PK |
| numero | VARCHAR(30) | NOT NULL, UNIQUE |
| bien_id | UUID | NOT NULL, FK → biens(id) |
| locataire_id | UUID | NOT NULL, FK → locataires(id) |
| date_debut | DATE | NOT NULL |
| date_fin | DATE | NOT NULL |
| montant_loyer | NUMERIC(12,0) | NOT NULL |
| charges | NUMERIC(12,0) | NOT NULL DEFAULT 0 |
| montant_caution | NUMERIC(12,0) | NOT NULL |
| avance_loyer | NUMERIC(12,0) | DEFAULT 0 |
| periodicite | VARCHAR(20) | NOT NULL, CHECK ∈ {mensuelle, trimestrielle, annuelle} |
| statut | VARCHAR(20) | NOT NULL DEFAULT 'brouillon', CHECK ∈ {brouillon, actif, resilie, termine} |
| valide_par | UUID | FK → utilisateurs(id) |
| date_validation | TIMESTAMPTZ | |
| contrat_parent_id | UUID | FK → contrats(id) (chaîne de renouvellement) |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |
| | | **UNIQUE (bien_id) WHERE statut='actif'** (un seul contrat actif par bien) |

### `revisions_loyer`
| Colonne | Type | Contrainte |
|---|---|---|
| id | UUID | PK |
| contrat_id | UUID | NOT NULL, FK → contrats(id) |
| ancien_montant | NUMERIC(12,0) | NOT NULL |
| nouveau_montant | NUMERIC(12,0) | NOT NULL |
| date_modification | DATE | NOT NULL |
| motif | TEXT | NOT NULL |
| demande_par | UUID | NOT NULL, FK → utilisateurs(id) |
| valide_par | UUID | FK → utilisateurs(id) |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |

### `cautions`
| Colonne | Type | Contrainte |
|---|---|---|
| id | UUID | PK |
| contrat_id | UUID | NOT NULL, UNIQUE, FK → contrats(id) |
| montant_initial | NUMERIC(12,0) | NOT NULL |
| date_versement | DATE | NOT NULL |
| statut | VARCHAR(30) | NOT NULL DEFAULT 'detenue', CHECK ∈ {detenue, remboursee, remboursee_avec_retenue} |
| montant_retenu | NUMERIC(12,0) | DEFAULT 0 |
| motif_retenue | TEXT | |
| montant_rembourse | NUMERIC(12,0) | |
| date_remboursement | DATE | |
| valide_par | UUID | FK → utilisateurs(id) |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |

### `factures`
| Colonne | Type | Contrainte |
|---|---|---|
| id | UUID | PK |
| numero | VARCHAR(30) | NOT NULL, UNIQUE |
| contrat_id | UUID | NOT NULL, FK → contrats(id) |
| date_emission | DATE | NOT NULL |
| periode | VARCHAR(20) | NOT NULL (ex. "2026-08" ou "2026-T3") |
| montant_loyer | NUMERIC(12,0) | NOT NULL |
| charges | NUMERIC(12,0) | NOT NULL DEFAULT 0 |
| arrieres | NUMERIC(12,0) | NOT NULL DEFAULT 0 |
| total_a_payer | NUMERIC(12,0) | NOT NULL |
| montant_paye | NUMERIC(12,0) | NOT NULL DEFAULT 0 |
| solde_restant | NUMERIC(12,0) | NOT NULL |
| statut | VARCHAR(20) | NOT NULL DEFAULT 'emise', CHECK ∈ {emise, partiellement_payee, payee, impayee} |
| date_echeance | DATE | NOT NULL |
| alerte_echeance_envoyee | BOOLEAN | NOT NULL DEFAULT false |
| relance_impaye_envoyee | BOOLEAN | NOT NULL DEFAULT false |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |

*Note : les colonnes `alerte_echeance_envoyee` et `relance_impaye_envoyee` ont été ajoutées au Sprint 6 pour garantir l'idempotence des relances locataire (RG-N04, D-026, D-027) — éviter qu'un cycle de relance rejoué renvoie plusieurs fois la même alerte. Champs techniques, non issus du CDC/dossier initial, sans impact sur une règle métier existante.*

### `paiements`
| Colonne | Type | Contrainte |
|---|---|---|
| id | UUID | PK |
| reference | VARCHAR(30) | NOT NULL, UNIQUE |
| facture_id | UUID | NOT NULL, FK → factures(id) |
| date_paiement | DATE | NOT NULL |
| montant | NUMERIC(12,0) | NOT NULL, CHECK (montant > 0) |
| mode | VARCHAR(20) | NOT NULL, CHECK ∈ {especes, virement, cheque, orange_money, mtn_money, moov_money, wave} |
| encaisse_par | UUID | NOT NULL, FK → utilisateurs(id) |
| statut | VARCHAR(20) | NOT NULL DEFAULT 'valide', CHECK ∈ {valide, corrige, annule} |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |

### `quittances`
| Colonne | Type | Contrainte |
|---|---|---|
| id | UUID | PK |
| numero | VARCHAR(30) | NOT NULL, UNIQUE |
| paiement_id | UUID | NOT NULL, UNIQUE, FK → paiements(id) |
| date | DATE | NOT NULL |
| lien_pdf | VARCHAR(255) | |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |

### `documents`
| Colonne | Type | Contrainte |
|---|---|---|
| id | UUID | PK |
| type_document | VARCHAR(50) | NOT NULL |
| reference | VARCHAR(150) | NOT NULL |
| lien_securise | VARCHAR(500) | NOT NULL |
| entite_type | VARCHAR(20) | NOT NULL, CHECK ∈ {bien, locataire, contrat, facture} |
| entite_id | UUID | NOT NULL |
| date_ajout | TIMESTAMPTZ | NOT NULL |
| ajoute_par | UUID | NOT NULL, FK → utilisateurs(id) |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |

### `notifications`
| Colonne | Type | Contrainte |
|---|---|---|
| id | UUID | PK |
| utilisateur_id | UUID | NOT NULL, FK → utilisateurs(id) |
| type | VARCHAR(20) | NOT NULL, CHECK ∈ {information, alerte, action_requise} |
| titre | VARCHAR(150) | NOT NULL |
| message | TEXT | NOT NULL |
| canal | VARCHAR(20) | CHECK ∈ {interne, email, sms, whatsapp} |
| lue | BOOLEAN | NOT NULL DEFAULT false |
| date | TIMESTAMPTZ | NOT NULL |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL |

### `audits`
| Colonne | Type | Contrainte |
|---|---|---|
| id | UUID | PK |
| utilisateur_id | UUID | NOT NULL, FK → utilisateurs(id) |
| date_heure | TIMESTAMPTZ | NOT NULL |
| action | VARCHAR(100) | NOT NULL |
| entite_type | VARCHAR(30) | NOT NULL |
| entite_id | UUID | NOT NULL |
| ancienne_valeur | JSONB | |
| nouvelle_valeur | JSONB | |
| created_at | TIMESTAMPTZ | NOT NULL |

## 10.2 Index complémentaires

- `contrats (locataire_id)`, `contrats (bien_id)` — recherches fréquentes.
- `factures (contrat_id, statut)` — suivi des impayés (RG-N04).
- `paiements (facture_id)`.
- `documents (entite_type, entite_id)` — résolution de l'association polymorphe.
- `audits (entite_type, entite_id)`, `audits (date_heure)`.

## 10.3 Script SQL PostgreSQL (annexe)

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE communes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quartiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commune_id UUID NOT NULL REFERENCES communes(id),
    nom VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (commune_id, nom)
);

CREATE TABLE utilisateurs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    profil VARCHAR(20) NOT NULL CHECK (profil IN ('administrateur','gerant','gestionnaire','consultation')),
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE biens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL UNIQUE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('maison','villa','appartement','studio','chambre','bureau','magasin','entrepot','terrain','immeuble','local_commercial')),
    designation VARCHAR(150) NOT NULL,
    description TEXT,
    quartier_id UUID NOT NULL REFERENCES quartiers(id),
    adresse VARCHAR(255) NOT NULL,
    loyer NUMERIC(12,0) NOT NULL CHECK (loyer >= 0),
    charges_mensuelles NUMERIC(12,0) NOT NULL DEFAULT 0,
    statut VARCHAR(20) NOT NULL DEFAULT 'libre' CHECK (statut IN ('libre','occupe','en_travaux')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE locataires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('physique','entreprise')),
    civilite VARCHAR(10),
    nom VARCHAR(100),
    prenoms VARCHAR(150),
    date_naissance DATE,
    nationalite VARCHAR(60),
    profession VARCHAR(100),
    raison_sociale VARCHAR(150),
    infos_administratives TEXT,
    representant VARCHAR(150),
    telephone_principal VARCHAR(20) NOT NULL,
    telephone_secondaire VARCHAR(20),
    email VARCHAR(150),
    contact_urgence VARCHAR(150),
    statut VARCHAR(20) NOT NULL DEFAULT 'actif' CHECK (statut IN ('actif','archive')),
    date_archivage DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pieces_identite (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    locataire_id UUID NOT NULL REFERENCES locataires(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('passeport','cni','carte_consulaire','permis')),
    numero VARCHAR(50) NOT NULL,
    date_expiration DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE contrats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(30) NOT NULL UNIQUE,
    bien_id UUID NOT NULL REFERENCES biens(id),
    locataire_id UUID NOT NULL REFERENCES locataires(id),
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    montant_loyer NUMERIC(12,0) NOT NULL,
    charges NUMERIC(12,0) NOT NULL DEFAULT 0,
    montant_caution NUMERIC(12,0) NOT NULL,
    avance_loyer NUMERIC(12,0) DEFAULT 0,
    periodicite VARCHAR(20) NOT NULL CHECK (periodicite IN ('mensuelle','trimestrielle','annuelle')),
    statut VARCHAR(20) NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon','actif','resilie','termine')),
    valide_par UUID REFERENCES utilisateurs(id),
    date_validation TIMESTAMPTZ,
    contrat_parent_id UUID REFERENCES contrats(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ux_contrats_bien_actif ON contrats (bien_id) WHERE statut = 'actif';
CREATE INDEX ix_contrats_locataire ON contrats (locataire_id);
CREATE INDEX ix_contrats_bien ON contrats (bien_id);

CREATE TABLE revisions_loyer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contrat_id UUID NOT NULL REFERENCES contrats(id),
    ancien_montant NUMERIC(12,0) NOT NULL,
    nouveau_montant NUMERIC(12,0) NOT NULL,
    date_modification DATE NOT NULL,
    motif TEXT NOT NULL,
    demande_par UUID NOT NULL REFERENCES utilisateurs(id),
    valide_par UUID REFERENCES utilisateurs(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cautions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contrat_id UUID NOT NULL UNIQUE REFERENCES contrats(id),
    montant_initial NUMERIC(12,0) NOT NULL,
    date_versement DATE NOT NULL,
    statut VARCHAR(30) NOT NULL DEFAULT 'detenue' CHECK (statut IN ('detenue','remboursee','remboursee_avec_retenue')),
    montant_retenu NUMERIC(12,0) DEFAULT 0,
    motif_retenue TEXT,
    montant_rembourse NUMERIC(12,0),
    date_remboursement DATE,
    valide_par UUID REFERENCES utilisateurs(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE factures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(30) NOT NULL UNIQUE,
    contrat_id UUID NOT NULL REFERENCES contrats(id),
    date_emission DATE NOT NULL,
    periode VARCHAR(20) NOT NULL,
    montant_loyer NUMERIC(12,0) NOT NULL,
    charges NUMERIC(12,0) NOT NULL DEFAULT 0,
    arrieres NUMERIC(12,0) NOT NULL DEFAULT 0,
    total_a_payer NUMERIC(12,0) NOT NULL,
    montant_paye NUMERIC(12,0) NOT NULL DEFAULT 0,
    solde_restant NUMERIC(12,0) NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'emise' CHECK (statut IN ('emise','partiellement_payee','payee','impayee')),
    date_echeance DATE NOT NULL,
    alerte_echeance_envoyee BOOLEAN NOT NULL DEFAULT false,
    relance_impaye_envoyee BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_factures_contrat_statut ON factures (contrat_id, statut);

CREATE TABLE paiements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference VARCHAR(30) NOT NULL UNIQUE,
    facture_id UUID NOT NULL REFERENCES factures(id),
    date_paiement DATE NOT NULL,
    montant NUMERIC(12,0) NOT NULL CHECK (montant > 0),
    mode VARCHAR(20) NOT NULL CHECK (mode IN ('especes','virement','cheque','orange_money','mtn_money','moov_money','wave')),
    encaisse_par UUID NOT NULL REFERENCES utilisateurs(id),
    statut VARCHAR(20) NOT NULL DEFAULT 'valide' CHECK (statut IN ('valide','corrige','annule')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_paiements_facture ON paiements (facture_id);

CREATE TABLE quittances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(30) NOT NULL UNIQUE,
    paiement_id UUID NOT NULL UNIQUE REFERENCES paiements(id),
    date DATE NOT NULL,
    lien_pdf VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_document VARCHAR(50) NOT NULL,
    reference VARCHAR(150) NOT NULL,
    lien_securise VARCHAR(500) NOT NULL,
    entite_type VARCHAR(20) NOT NULL CHECK (entite_type IN ('bien','locataire','contrat','facture')),
    entite_id UUID NOT NULL,
    date_ajout TIMESTAMPTZ NOT NULL DEFAULT now(),
    ajoute_par UUID NOT NULL REFERENCES utilisateurs(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_documents_entite ON documents (entite_type, entite_id);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id UUID NOT NULL REFERENCES utilisateurs(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('information','alerte','action_requise')),
    titre VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    canal VARCHAR(20) CHECK (canal IN ('interne','email','sms','whatsapp')),
    lue BOOLEAN NOT NULL DEFAULT false,
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id UUID NOT NULL REFERENCES utilisateurs(id),
    date_heure TIMESTAMPTZ NOT NULL DEFAULT now(),
    action VARCHAR(100) NOT NULL,
    entite_type VARCHAR(30) NOT NULL,
    entite_id UUID NOT NULL,
    ancienne_valeur JSONB,
    nouvelle_valeur JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_audits_entite ON audits (entite_type, entite_id);
CREATE INDEX ix_audits_date ON audits (date_heure);
```

*Note : le champ `canal` de la table `notifications` a été ajouté pour distinguer les canaux de relance (interne, email, SMS, WhatsApp — D-026, D-027), en complément du modèle de base du CDC.*
