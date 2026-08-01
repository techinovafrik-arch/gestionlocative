# État d'avancement du développement

> Mis à jour à la fin de chaque sprint. Complète `00-cadrage-technique.md`
> (le plan) sans le dupliquer : ce fichier dit où on en est, pas ce qui est prévu.

## Sprint courant

**Sprint 7 — Rapports et tableau de bord** : à démarrer.

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
| 7 | Rapports et tableau de bord | ⏳ À faire |
| 8 | Import Excel initial, durcissement sécurité | ⏳ À faire |
| 9 | Recette, corrections, mise en production | ⏳ À faire |

Détail des exigences couvertes : voir `dossier/15-cdcf.md` (EF-01 à EF-32,
ENF-01 à ENF-09). Tous les EF **Must** de la facturation/paiements/contrats/
biens/locataires/utilisateurs/documents/notifications sont implémentés.

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

Sprint 7 : tableau de bord (indicateurs CDC §16.2) et rapports (§16.3 à
§16.8) — écrans de consultation, filtres, exports PDF/Excel (RG-X02).
