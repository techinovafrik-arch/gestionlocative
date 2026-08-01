# État d'avancement du développement

> Mis à jour à la fin de chaque sprint. Complète `00-cadrage-technique.md`
> (le plan) sans le dupliquer : ce fichier dit où on en est, pas ce qui est prévu.

## Sprint courant

**Sprint 8 — Import Excel initial, durcissement sécurité** : à démarrer.

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
| 8 | Import Excel initial, durcissement sécurité | ⏳ À faire |
| 9 | Recette, corrections, mise en production | ⏳ À faire |

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
- Compte administrateur du seed : `admin@cimec.local`, mot de passe affiché
  une seule fois à l'exécution de `npx prisma db seed` (le régénérer si perdu :
  supprimer la ligne dans `utilisateurs` puis relancer le seed).

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

Sprint 8 : import initial des données existantes via Excel (D-011),
durcissement sécurité (ENF-04, ENF-05 — session, sauvegardes), finalisation
du journal d'audit (déjà largement fonctionnel depuis les sprints précédents).
