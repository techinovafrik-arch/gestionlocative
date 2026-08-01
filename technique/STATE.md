# État d'avancement du développement

> Mis à jour à la fin de chaque sprint. Complète `00-cadrage-technique.md`
> (le plan) sans le dupliquer : ce fichier dit où on en est, pas ce qui est prévu.

## Sprint courant

**Sprint 9 — Recette, corrections, mise en production** : recette technique
et livrables terminés ; la mise en production réelle reste bloquée par le
choix du VPS (point ouvert #4) — procédure prête, voir
`technique/11-deploiement.md`.

## Suivi des sprints

| Sprint | Contenu | Statut |
|---|---|---|
| 0 | Scaffolding (Next.js, Prisma, Auth, permissions, CI) | ✅ Fait |
| 1 | CRUD Biens, Locataires, Utilisateurs | ✅ Fait |
| 2 | Cycle de vie des contrats (création, validation, révision, clôture, PDF) | ✅ Fait |
| 3 | Facturation automatique (mensuelle + globale trimestrielle/annuelle) | ✅ Fait |
| 4 | Paiements, imputation, correction, quittances | ✅ Fait |
| 5 | Gestion documentaire, suivi des cautions | ✅ Fait |
| 6 | Notifications multi-canal (architecture posée, fournisseurs en stub) | ✅ Fait |
| 7 | Rapports et tableau de bord | ✅ Fait |
| 8 | Import Excel initial, durcissement sécurité | ✅ Fait |
| 9 | Recette, corrections, mise en production | ✅ Recette faite — déploiement en attente du VPS |

Détail des exigences couvertes : voir `dossier/15-cdcf.md` (EF-01 à EF-32,
ENF-01 à ENF-09). Tous les EF **Must** sont implémentés.

### Sprint 7 — précisions

- Tableau de bord (`/`) : indicateurs immobiliers/financiers/locatifs (CDC
  §16.2) + 4 graphiques (CDC §16.9) via Recharts, palette validée par le
  skill dataviz (cohérente avec la charte bleu/orange D-032).
- 16 rapports de la section 13.4 couverts (`src/lib/rapports/*.ts`),
  regroupés en 4 écrans thématiques (`/rapports/immobilier`,
  `/rapports/locataires-contrats`, `/rapports/financier`, `/rapports/synthese`)
  + `/cautions` existant. Export Excel natif (exceljs) pour chacun via
  `/api/rapports/excel?type=...`.
- **Simplification assumée** : l'export PDF s'appuie sur l'impression
  navigateur (mise en page tabulaire déjà « imprimable directement » au sens
  RG-X02) plutôt que 16 gabarits PDF dédiés comme pour contrat/facture/
  quittance — ceux-là restent des documents PDF générés (react-pdf).
- **Permissions simplifiées** : tous les rapports sont gérés par une seule
  ressource `rapports` (lecture ouverte aux 4 profils) plutôt que la
  restriction fine par rapport listée en section 13.4 (certains rapports y
  excluent Gestionnaire ou Consultation). À durcir si un besoin réel émerge.

### Sprint 8 — précisions

- **Import Excel initial** (EF-32, D-011) : classeur à 3 feuilles (Biens,
  Locataires, Contrats) + feuille d'instructions, généré par
  `GET /api/import/modele`. Analyse en deux temps :
  `POST /api/import/analyser` (validation + contrôles croisés, n'écrit rien)
  puis `POST /api/import/executer` (ré-analyse + transaction Prisma,
  timeout 60s). Écran `/import`. Réservé à l'Administrateur (D-041, ajouté à
  la matrice §14.1 — absent de la matrice initiale du dossier).
  Codes bien/locataire/contrat laissés vides sont générés séquentiellement ;
  laissés vides ET référencés depuis la feuille Contrats du même classeur,
  ils ne sont pas résolubles (message d'erreur explicite à l'analyse) — la
  feuille d'instructions le signale. Tous les contrats importés sont créés
  directement `actif` (reprise de contrats *en cours*, hors circuit normal de
  validation par le gérant), avec caution `detenue` correspondante.
- **ENF-04** (déconnexion après 30 min d'inactivité) : `session.maxAge` /
  `updateAge` dans `src/lib/auth.ts` (30 min / 5 min glissant). Vérifié
  manuellement : cookie de session avec `Expires` = heure de connexion + 30 min.
- **ENF-05** (sauvegardes quotidiennes, rétention 30 jours) : scripts
  `scripts/sauvegarde.sh` / `scripts/restauration.sh` (pg_dump/psql, hors
  application Next.js — à brancher en cron sur le VPS de production, point
  ouvert #4). Testés localement (sauvegarde + restauration vers une base
  scratch, comptage de lignes identique) ; non actifs tant que le VPS n'est
  pas choisi.
- **Journal d'audit** : écran `/audit` (Administrateur, Gérant — §14.1),
  filtrable par utilisateur/entité/période. Le journal lui-même était déjà
  fonctionnel côté écriture depuis les sprints précédents (RG-U03) ; il
  manquait l'écran de consultation prévu en section 12 du dossier.

### Sprint 9 — précisions

- **Recette technique** (`technique/09-recette.md`) : scénario de bout en
  bout réel (HTTP, cookies, 3 profils) rejouant le cycle de vie complet
  bien → contrat → validation → facturation → paiement → clôture → caution,
  en plus des 12 tests unitaires et 46 tests d'intégration. Chaque EF/ENF de
  `dossier/15-cdcf.md` est mappé à sa vérification (test automatisé, étape
  du scénario, ou sprint antérieur).
- **Anomalie trouvée et corrigée** : le Gestionnaire locatif n'avait pas
  accès en lecture aux contrats (`src/lib/permissions.ts` omettait `lire`
  pour ce profil sur la ressource `contrats`, contrairement à
  `dossier/14-securite-profils.md §14.1`) — menu et PDF contrat
  inaccessibles pour l'utilisateur principal au quotidien. Corrigé, testé
  (`tests/unit/permissions.test.ts`), revérifié en direct.
- **Guide utilisateur** (`technique/10-guide-utilisateur.md` /
  `.docx`) : support de formation par profil (critère de réception CDC §21
  — « comptes créés, formation réalisée »). Généré en `.docx` via pandoc
  (même méthode que `dossier/DOSSIER-CONCEPTION-COMPLET.docx`).
- **Runbook de mise en production** (`technique/11-deploiement.md`) :
  procédure complète (provisionnement VPS, PostgreSQL, Nginx + Let's
  Encrypt, activation du job `deploy` de la CI, crontab des 4 endpoints
  `/api/cron/*` + sauvegarde, checklist post-déploiement, rollback) — prête
  à exécuter dès le VPS choisi, aucune étape ne peut être testée avant.

## Environnement de développement local

- **PostgreSQL 17** installé localement (Windows), service `postgresql-x64-17`.
- Rôle applicatif : `gestionlocative` / mot de passe `gestionlocative_dev`
  (droit CREATEDB accordé, nécessaire à `prisma migrate dev` pour la shadow DB).
- Bases : `gestionlocative` (dev) et `gestionlocative_test` (intégration).
- `.env` local non commité (gitignored) — contient `DATABASE_URL`,
  `NEXTAUTH_SECRET` généré, `CRON_SECRET=dev-local-cron-secret`.
- Comptes de test créés en base dev (hors seed, à recréer si besoin) :
  `gestionnaire@cimec.local` / `Gestion1234`, `gerant@cimec.local` /
  `Gerant1234` — actuellement **désactivés** (`actif=false`) après chaque
  session de test manuel pour ne pas polluer une éventuelle démo.
- Compte administrateur du seed : `admin@cimec.local`. Mot de passe actuel
  (base dev locale uniquement) : `AdminTest1234`, fixé manuellement au
  Sprint 8 pour la vérification de l'import et de l'audit (le hash seed
  original avait été perdu — la ligne `utilisateurs` a une contrainte FK
  depuis `audits`, donc suppression + reseed impossible une fois des audits
  enregistrés ; on met à jour `mot_de_passe_hash` directement à la place).
  À changer avant toute démo/publication de la base.

## Points ouverts non résolus (cadrage technique §6)

Toujours « à trancher plus tard » — sans impact sur le code déjà écrit
(architecture en stub, cf. `lib/notifications/canaux.ts`) :

1. Fournisseur SMS
2. Fournisseur WhatsApp Business API
3. Fournisseur email transactionnel
4. VPS (hébergement production) — bloque le déploiement CI/CD (job `deploy`
   dans `.github/workflows/ci.yml`, actuellement inactif faute de secrets)
5. Compte Google Drive professionnel (sans impact : les liens sont saisis
   manuellement, aucune intégration API Drive nécessaire en V1)

## Prochaine action

Le développement des 9 sprints est terminé. Il ne reste plus que des actions
côté agence/hébergement, toutes documentées et prêtes à exécuter dès
disponibles :

1. Trancher les points ouverts 1-5 (`§ ci-dessous`), en particulier le VPS
   (#4) qui conditionne la mise en production.
2. Suivre `technique/11-deploiement.md` une fois le VPS disponible.
3. Diffuser `technique/10-guide-utilisateur.docx` et organiser la formation
   avec l'agence (dernier critère de réception CDC §21 non encore réalisé,
   car il nécessite la présence de l'agence).
