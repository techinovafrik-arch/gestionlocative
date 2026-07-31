# Cadrage technique du développement — Application de gestion locative CIMEC

> Ce document prend le relai du dossier de conception (`dossier/`, 16 sections validées) pour préparer le démarrage du code. Il ne redéfinit aucune règle métier : il traduit les exigences déjà validées (section 15 — CDCF) en organisation technique.

## 1. Architecture technique

### 1.1 Décision d'architecture

**Next.js full-stack** : un seul projet Next.js (App Router) hébergeant à la fois le frontend React et le backend (API routes Node.js), avec Prisma comme ORM vers PostgreSQL.

```mermaid
flowchart TD
    U[Utilisateurs - navigateur web] --> N[Next.js - App Router]
    N --> P[Pages React - frontend]
    N --> A[API Routes - backend Node.js]
    A --> PR[Prisma ORM]
    PR --> DB[(PostgreSQL)]
    A --> CRON[Tâche planifiée - facturation le 25]
    A --> MAIL[Email SMTP]
    A --> SMS[SMS API]
    A --> WA[WhatsApp Business API]
    A --> GD[Google Drive API - liens documents]
```

Ce choix satisfait les exigences du CDC (§18.1, §18.2 : application web, frontend + « API backend » + PostgreSQL) : les API routes Next.js **sont** le backend Node.js exigé, tout en réduisant à un seul déployable la complexité d'exploitation (cohérent avec une équipe de 5 personnes et un seul VPS — ENF-06).

### 1.2 Stack retenue

| Couche | Choix | Source |
|---|---|---|
| Frontend | React 18 (via Next.js, App Router) | CLAUDE.md |
| Backend | Node.js 20 LTS, API routes Next.js | CLAUDE.md, CDC §18 |
| ORM | Prisma | Profil technique TECHNOLOGIE ET INNOVATION AFRIK |
| Base de données | PostgreSQL | CDC §18, section 10 (MLD) |
| Style UI | Tailwind CSS | CLAUDE.md |
| Authentification | NextAuth.js (Credentials Provider), sessions JWT | Standard Next.js, compatible profils uniques (RG-U01) |
| Génération PDF | `@react-pdf/renderer` (contrat, facture, quittance) | Section 13 |
| Génération Excel | `exceljs` (rapports, import initial) | RG-X02, D-011 |
| Hébergement | VPS Linux Ubuntu, 4 Go RAM min., SSD | CLAUDE.md, CDC §18 |
| Reverse proxy / HTTPS | Nginx + Let's Encrypt (Certbot) | CDC §18 (HTTPS obligatoire) |
| Process manager | PM2 (ou Docker + docker-compose) | Standard déploiement Node.js sur VPS |

## 2. Structure du dépôt (monorepo)

```
gestionlocative/
├── CLAUDE.md
├── docs/
│   └── cahier-des-charges.md
├── dossier/                       # Dossier de conception (existant)
├── technique/                     # Cadrage technique (ce document + suite)
├── prisma/
│   ├── schema.prisma              # Dérivé de la section 10 (MLD)
│   └── migrations/
├── src/
│   ├── app/                       # App Router Next.js
│   │   ├── (auth)/                # Connexion, mot de passe oublié
│   │   ├── (dashboard)/           # Écrans protégés par profil
│   │   │   ├── biens/
│   │   │   ├── locataires/
│   │   │   ├── contrats/
│   │   │   ├── factures/
│   │   │   ├── paiements/
│   │   │   ├── cautions/
│   │   │   ├── documents/
│   │   │   ├── rapports/
│   │   │   ├── utilisateurs/
│   │   │   └── audit/
│   │   └── api/                   # API routes (backend)
│   │       ├── biens/
│   │       ├── locataires/
│   │       ├── contrats/
│   │       ├── factures/
│   │       ├── paiements/
│   │       ├── cautions/
│   │       ├── notifications/
│   │       ├── cron/               # Endpoints déclenchés par le planificateur
│   │       └── auth/
│   ├── components/                # Composants UI réutilisables
│   ├── lib/
│   │   ├── prisma.ts               # Client Prisma singleton
│   │   ├── auth.ts                 # Config NextAuth
│   │   ├── permissions.ts          # Matrice de permissions (section 14.1)
│   │   ├── pdf/                    # Générateurs contrat/facture/quittance
│   │   ├── notifications/          # Email, SMS, WhatsApp
│   │   └── validations/            # Schémas Zod par entité
│   └── types/
├── tests/
│   ├── unit/
│   └── integration/
├── .github/workflows/              # CI/CD (section 4)
├── .env.example
├── package.json
└── tsconfig.json
```

**Conventions de code** :
- TypeScript strict sur l'ensemble du projet.
- Validation des entrées avec **Zod**, appliquée à chaque API route (aucune donnée non validée n'atteint Prisma).
- Montants manipulés en entiers (FCFA sans décimales — RG-X01), jamais en `float`.
- Suppression logique uniquement (statuts `archive`, jamais de `DELETE` physique — cf. section 10).
- Commentaires de code en français (profil TECHNOLOGIE ET INNOVATION AFRIK), noms de variables/fonctions en anglais.
- Un composant/module par responsabilité ; pas d'abstraction anticipée non requise par le CDCF.

## 3. Environnements et configuration

### 3.1 Environnements

| Environnement | Usage | Base de données |
|---|---|---|
| Local (développement) | Poste des développeurs | PostgreSQL local (Docker ou natif) |
| Staging | Recette avec l'agence avant mise en production | PostgreSQL dédié sur le VPS (ou instance séparée) |
| Production | Usage réel par CIMEC | PostgreSQL sur le VPS, sauvegardes quotidiennes (D-039) |

### 3.2 Variables d'environnement (`.env.example`)

```
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/gestionlocative"

# Authentification
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""

# Email (notifications, factures, quittances)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM="CIMEC <notifications@cimec.example>"

# SMS (relances impayés - RG-N04)
SMS_PROVIDER_API_KEY=""
SMS_PROVIDER_SENDER_ID="CIMEC"

# WhatsApp Business API (relances impayés - D-027)
WHATSAPP_API_TOKEN=""
WHATSAPP_PHONE_NUMBER_ID=""

# Google Drive (gestion documentaire - RG-D01)
GOOGLE_DRIVE_CLIENT_EMAIL=""
GOOGLE_DRIVE_PRIVATE_KEY=""
GOOGLE_DRIVE_FOLDER_ID=""

# Tâche planifiée (sécurisation de l'endpoint cron)
CRON_SECRET=""
```

*(Ces variables sont des noms indicatifs ; les valeurs réelles ne doivent jamais être commitées — `.env` est déjà exclu par `.gitignore`.)*

### 3.3 Modèle de données technique

Le schéma Prisma (`prisma/schema.prisma`) sera dérivé directement du script SQL de la **section 10 (MLD)** — tables, contraintes, index et énumérations telles que définies et validées, sans réinterprétation métier.

## 4. CI/CD et déploiement

### 4.1 Pipeline GitHub Actions

```mermaid
flowchart LR
    PR[Pull Request] --> Lint[Lint + TypeCheck]
    Lint --> Test[Tests unitaires + intégration]
    Test --> Build[Build Next.js]
    Build -->|PR| Review[Revue de code]
    Build -->|merge sur main| Deploy[Déploiement VPS]
    Deploy --> Migrate[Prisma migrate deploy]
    Migrate --> Restart[Redémarrage PM2 / conteneur]
```

- **À chaque Pull Request** : lint (ESLint), vérification TypeScript, tests unitaires et d'intégration (base PostgreSQL de test, pas de mock de la base — cohérent avec les règles métier critiques comme RG-P06, RG-F08).
- **À la fusion sur `main`** : build de production, déploiement automatique sur le VPS (connexion SSH avec clé dédiée stockée en secret GitHub), exécution des migrations Prisma, redémarrage du processus.
- **Secrets GitHub** à provisionner : `VPS_HOST`, `VPS_SSH_KEY`, `DATABASE_URL` (staging/prod), clés des intégrations (section 3.2).

### 4.2 Sauvegardes et supervision

- Sauvegarde automatique quotidienne de PostgreSQL (`pg_dump` planifié), rétention 30 jours (D-039), stockée hors du VPS applicatif (ex. espace de stockage séparé).
- Surveillance de base (uptime, espace disque) à mettre en place dès la mise en production — outil à définir (ex. Uptime Kuma auto-hébergé, simple et gratuit).

## 5. Plan de sprints (backlog technique)

Livraison en un seul bloc côté client (D-022) : ce découpage en sprints est un outil **interne** à l'équipe de développement, sans mise en service progressive pour l'agence. Chaque sprint correspond à environ 2 semaines ; la date de démarrage reste à définir (échéance non déterminée — D-009).

| Sprint | Contenu | Exigences couvertes (section 15) |
|---|---|---|
| Sprint 0 | Setup repo, CI/CD, environnements, schéma Prisma, authentification, matrice de permissions | ENF-01 à ENF-03, ENF-06 |
| Sprint 1 | Utilisateurs, Biens, Locataires (CRUD + statuts) | EF-01 à EF-06, EF-30 |
| Sprint 2 | Contrats : création, validation gérant, génération PDF (2 trames) | EF-07 à EF-12 |
| Sprint 3 | Facturation : génération automatique le 25, mois plein, facture globale trimestrielle/annuelle | EF-13 à EF-16 |
| Sprint 4 | Paiements, imputation, correction, quittances | EF-17 à EF-20 |
| Sprint 5 | Cautions, gestion documentaire (liens Google Drive) | EF-21 à EF-23 |
| Sprint 6 | Notifications multi-canal (interne, email, SMS, WhatsApp), rapport mensuel automatique | EF-24 à EF-26 |
| Sprint 7 | Rapports (immobiliers, locataires, contrats, financiers, cautions), tableau de bord et graphiques | EF-27 à EF-29 |
| Sprint 8 | Journal d'audit complet, import initial Excel, durcissement sécurité | EF-31, EF-32, ENF-04, ENF-05 |
| Sprint 9 | Recette avec l'agence, corrections, formation utilisateurs, mise en production | Critères de réception (CDC §21) |

## 6. Points ouverts à trancher avant le Sprint 0

**Statut : à trancher plus tard**, par décision de l'agence (31/07/2026). Ces choix n'affectent pas les règles métier déjà validées ; ils sont sans impact sur le Sprint 0 (authentification, modèle de données, CRUD de base) mais devront être arbitrés avant les sprints concernés.

| # | Question | Impact | Sprint concerné |
|---|---|---|---|
| 1 | Fournisseur **SMS** pour les relances impayés (RG-N04) — agrégateur international (ex. Twilio, Vonage) ou opérateur local ? | Intégration `lib/notifications/sms.ts`, coût récurrent | Sprint 6 |
| 2 | Fournisseur **WhatsApp Business API** (D-027) — API Cloud Meta directe, ou intermédiaire (ex. 360dialog, Twilio) ? | Intégration `lib/notifications/whatsapp.ts`, coût récurrent | Sprint 6 |
| 3 | Fournisseur **email transactionnel** (envoi factures/quittances/relances) — SMTP Gmail existant (cimec@gmail.com) ou service dédié (ex. Brevo, Resend) ? | Délivrabilité, volumétrie (~85 factures/mois + relances) | Sprint 3, Sprint 6 |
| 4 | **VPS** : fournisseur déjà choisi, ou à provisionner (OVH, Hostinger, DigitalOcean...) ? Accès SSH à prévoir pour le déploiement CI/CD | Sprint 0 (déploiement), section 4.1 | Avant mise en production (Sprint 9) |
| 5 | Compte **Google Drive professionnel** déjà créé pour le stockage documentaire (RG-D01) ? | Sprint 5, configuration `GOOGLE_DRIVE_*` | Sprint 5 |
