# Mémoire de développement

> Ce que le code ne dit pas tout seul : décisions techniques d'implémentation,
> pièges rencontrés, conventions à respecter en continuant le développement.
> Les décisions **métier** sont dans `dossier/00-journal-decisions.md` (D-XXX)
> — ne pas dupliquer ici. Ce fichier est technique uniquement.

## Prisma 7 : driver adapter obligatoire

Prisma 7 a retiré le moteur Rust embarqué : `schema.prisma` ne contient plus
`url` dans `datasource` (déplacé dans `prisma.config.ts`), et `PrismaClient`
doit recevoir un adapter (`@prisma/adapter-pg` ici). Voir `src/lib/prisma.ts`
et `prisma.config.ts`. Ne pas revenir à l'ancien pattern `new PrismaClient()`
sans adapter — ça ne compile plus.

Le client généré sort dans `src/generated/prisma/` (configuré explicitement
dans `generator client { output = ... }`), pas dans `node_modules/@prisma/client`
par défaut. Toujours importer via `@/generated/prisma`, jamais `@prisma/client`.
Ce dossier est gitignored et régénéré par `postinstall`/`prisma generate`.

## Contrainte "un seul contrat actif par bien"

Index PostgreSQL partiel, **pas exprimable dans `schema.prisma`** (pas de
support des index filtrés côté Prisma stable). Appliqué en SQL brut dans la
migration `20260801093500_contrat_actif_unique`. Si le schéma est un jour
reset via `prisma migrate reset` ou régénéré depuis zéro, vérifier que cette
migration (ou son équivalent) est bien rejouée — sinon deux contrats actifs
peuvent coexister sur le même bien sans erreur.

## Next.js 16 : `proxy.ts`, pas `middleware.ts`

Le fichier s'appelle `src/proxy.ts` et exporte `proxy` (pas `middleware`).
L'ancien nom fonctionne encore mais affiche un avertissement de dépréciation
au build. Le wrapper `auth(...)` de NextAuth v5 doit envelopper une fonction
qui vérifie explicitement `request.auth` et redirige — le simple
ré-export `export { auth as proxy }` ne redirige **pas** automatiquement les
utilisateurs non connectés (comportement contre-intuitif, déjà corrigé une
fois pendant le Sprint 1).

## Comptes système (audits automatisés)

La table `audits.utilisateur_id` est NOT NULL. Les actions déclenchées par un
cron (génération de facture, renouvellement tacite, relances...) n'ont pas
d'utilisateur humain. Solution : un compte technique `systeme@cimec.local`
(profil `administrateur`, `actif=false`, mot de passe aléatoire jamais
communiqué), créé à la volée par `obtenirUtilisateurSysteme()` dans
`src/lib/audit.ts`. Ne pas créer un second mécanisme pour ce même besoin.

## Idempotence des tâches cron

Tous les endpoints `/api/cron/*` sont conçus pour être rejoués sans effet de
bord (sécurité si le planificateur externe redéclenche ou si on teste
manuellement) :
- Facturation : clé unique `(contrat_id, periode)`.
- Renouvellement tacite : le contrat source passe `termine`, donc ne
  réapparaît plus dans la recherche des contrats actifs échus.
- Relances : indicateurs booléens `alerte_echeance_envoyee` /
  `relance_impaye_envoyee` sur `factures` (ajoutés Sprint 6, hors CDC initial).

Aucun de ces endpoints ne vérifie la date du jour (« le 25 », « avant le 10 »
etc.) — c'est la responsabilité du planificateur externe de les déclencher au
bon moment. Le code lui-même reste "bête et rejouable".

## Notifications : deux publics différents, ne pas les confondre

- **Notifications internes** (`notifications`, table liée à `utilisateurs`) :
  destinées au staff (Administrateur/Gérant/Gestionnaire). Toujours passer par
  `notifierStaff()` / `creerNotificationInterne()` dans
  `src/lib/notifications/interne.ts`.
- **Relances locataire** (`src/lib/relances.ts`) : destinées au locataire, qui
  n'a pas de compte `Utilisateur` (D-013) — impossible de créer une ligne
  `Notification` pour lui. Ces envois passent uniquement par les canaux
  externes (`src/lib/notifications/canaux.ts`), sans trace en base autre que
  les deux booléens sur `factures`.

Les fonctions `envoyerEmail`/`envoyerSms`/`envoyerWhatsapp` sont des **stubs**
tant que les points ouverts 1-3 ne sont pas tranchés : elles vérifient la
présence des variables d'environnement et journalisent, sans jamais échouer
silencieusement ni prétendre avoir envoyé un message. Brancher le vrai
fournisseur = modifier uniquement ces 3 fonctions, signature inchangée.

## Base de test locale

`npm run test:integration` cible `gestionlocative_test` par défaut (voir
`vitest.integration.config.ts`), différente de la base de dev. Si de
nouveaux champs sont ajoutés au schéma, penser à appliquer la migration sur
**les deux** bases :
```
npx prisma migrate dev                      # base dev (gestionlocative)
DATABASE_URL="postgresql://gestionlocative:gestionlocative_dev@localhost:5432/gestionlocative_test" npx prisma migrate deploy
```
La CI applique automatiquement les migrations sur sa propre base éphémère
(`.github/workflows/ci.yml`), pas besoin d'y penser côté CI.

## Générateurs de code (`src/lib/codes.ts`) et transactions interactives

Ces générateurs (`genererCodeBien`, etc.) interrogent le client Prisma
**global**, jamais un client `tx`. Dans une transaction interactive
(`prisma.$transaction(async (tx) => ...)`) qui crée plusieurs lignes de la
même table en boucle, les appeler ferait courir le risque de générer deux
fois le même code (le `count()` du générateur ne voit pas les lignes déjà
créées dans la transaction en cours, non commitée). Solution appliquée dans
`src/lib/import/executer.ts` : un compteur local à la transaction, initialisé
une fois par `tx.xxx.count()` puis incrémenté en mémoire à chaque ligne. Ne
pas réutiliser `codes.ts` tel quel dans un futur traitement en lot.

## Audit : toujours après le commit, jamais dans une transaction

Convention déjà en place avant le Sprint 8 (`/api/contrats/[id]/valider`) et
reconduite depuis : `enregistrerAudit()` s'appelle **après** que la
transaction métier a commité, avec le client Prisma global — jamais avec un
client `tx` à l'intérieur du callback de `$transaction`. Une transaction
longue (import en lot, ex. `executerImport`) collecte donc les entités créées
dans des tableaux, puis boucle sur `enregistrerAudit()` une fois la
transaction terminée.

## Dates saisies dans un classeur Excel : `z.coerce.date()` ne suffit pas

Une cellule Excel arrive soit en `Date` (cellule formatée date), soit en
texte `JJ/MM/AAAA` (format demandé aux utilisateurs, cf. modèle d'import).
`new Date("15/03/1985")` (ce que fait `z.coerce.date()`) donne `Invalid
Date` — JS attend `MM/DD/YYYY` ou de l'ISO. Solution dans
`src/lib/import/schemas.ts` (`versDateOuBrut` + `dateExcel(...)`) : un
`z.preprocess` qui reconnaît explicitement `JJ/MM/AAAA` avant de retomber sur
`Date`/ISO. À réutiliser pour tout futur champ date alimenté depuis un
fichier Excel (ne pas revenir à `z.coerce.date()` nu sur ce genre d'entrée).

## Vérification manuelle systématique

Chaque sprint a été vérifié par un test HTTP réel (login via
`/api/auth/callback/credentials`, appels API avec cookies) en plus des tests
automatisés, pas seulement par les tests unitaires/intégration — utile pour
attraper les problèmes de câblage (permissions, ordre des transactions
Prisma, etc.) que les tests ciblés peuvent manquer. Réflexe à garder pour les
sprints suivants.
