# CLAUDE.md — Application de Gestion Locative — Agence CISSE MEDOUNE

## Contexte du projet

Conception puis développement d'une application web de gestion locative immobilière pour l'agence **CISSE MEDOUNE** (Abidjan, Côte d'Ivoire). L'agence gère son propre patrimoine (biens non meublés : maisons, villas, appartements, studios, chambres, bureaux, magasins, entrepôts, terrains, immeubles, locaux commerciaux) réparti dans plusieurs quartiers d'Abidjan (Treichville, Zone IV, Zone III...).

Le document de référence est `docs/cahier-des-charges.md` (version 1.0, juillet 2026). **Toute décision de conception doit être traçable vers une exigence du cahier des charges.** En cas d'ambiguïté ou de silence du CDC : poser la question au client, ne jamais inventer.

## Phase actuelle : DÉVELOPPEMENT

Le **dossier de conception** (16 sections, `dossier/`) est **validé au complet** (voir `dossier/00-journal-decisions.md`, 40 décisions actées) et assemblé (`dossier/DOSSIER-CONCEPTION-COMPLET.md` / `.docx`). Toute règle métier, tout écran, toute exigence s'y trouve déjà tranché — ne pas rouvrir ces décisions sans une raison explicite du client ; en cas de nouvelle question métier, l'ajouter au journal des décisions comme les précédentes.

Le **cadrage technique** (`technique/00-cadrage-technique.md`) traduit ce dossier en plan d'implémentation : architecture, structure du dépôt, environnements, CI/CD et plan de sprints dérivé des exigences EF-XX/ENF-XX de la section 15 du dossier.

Le **Sprint 0** (scaffolding) est réalisé : projet Next.js (App Router, TypeScript, Tailwind), schéma Prisma dérivé du MLD (section 10), authentification NextAuth avec les 4 profils, matrice de permissions (section 14.1), pipeline CI GitHub Actions. Le développement des modules métier (Sprints 1+) suit le plan de sprints du cadrage technique §5.

Rappel des 16 sections du dossier de conception (référence, pas à refaire) :

1. Présentation de l'agence
2. Contexte et objectifs
3. Analyse des besoins
4. Acteurs du système
5. Règles de gestion
6. Analyse fonctionnelle
7. Cas d'utilisation
8. Processus métier
9. Modèle conceptuel de données (MCD)
10. Modèle logique de données (MLD)
11. Dictionnaire des données
12. Interfaces de l'application
13. États et rapports
14. Sécurité et profils utilisateurs
15. Cahier des charges fonctionnel
16. Évolutions futures

## Méthode de travail (impérative)

À chaque étape :
1. **Poser les questions indispensables** — uniquement celles auxquelles le CDC ne répond pas déjà. Proposer une réponse par défaut issue du CDC quand elle existe ("Le CDC indique X, confirmez-vous ?").
2. **Attendre la validation explicite** des réponses par l'utilisateur.
3. **Rédiger la section** correspondante dans `dossier/NN-nom-section.md`.
4. **Faire valider la section** avant de passer à l'étape suivante.
5. Consigner chaque décision dans `dossier/00-journal-decisions.md` (date, question, réponse, impact).

Ne jamais rédiger plusieurs sections d'un coup sans validation intermédiaire. Ne jamais sauter une étape.

Cette méthode reste la référence si une section du dossier doit être rouverte (évolution de périmètre, question métier oubliée). Utiliser le skill `conception-dossier` dans ce cas.

## Skills du projet

- `conception-dossier` — workflow étape par étape du dossier de conception (questions, validation, plan de chaque section). Sert désormais surtout à rouvrir/amender une section déjà validée.
- `regles-metier` — règles de gestion extraites du CDC (source de vérité métier : facturation le 25, validations du gérant, archivage 1 an, etc.). Traduites en code dans `src/lib/` (ex. `permissions.ts`) — toute évolution de règle passe d'abord par ce skill/le dossier, pas par le code.
- `modele-donnees` — base pour le MCD/MLD/dictionnaire : entités, relations et attributs identifiés dans le CDC. Le schéma `prisma/schema.prisma` en est la traduction directe.
- `redaction-livrables` — conventions de rédaction, formats (Markdown, Mermaid), nommage des fichiers, génération des exports.

## Décisions techniques figées par le CDC

- **Type** : application web responsive (PC, tablette, smartphone).
- **Frontend** : React.js / Next.js.
- **Backend** : Node.js (API).
- **Base de données** : PostgreSQL.
- **Documents** : stockés sur Google Drive professionnel (ou équivalent) ; l'application ne conserve que référence, type, lien sécurisé, association métier.
- **Hébergement** : VPS Linux Ubuntu, 4 Go RAM min, SSD, HTTPS obligatoire.
- **Sécurité** : HTTPS, droits par profil, mots de passe chiffrés (hash), sauvegardes automatiques, journal d'audit.
- **Devise** : FCFA (XOF). Pas de décimales dans les montants courants.
- **Langue de l'application et du dossier** : français.

## Périmètre

**Inclus (V1)** : biens, locataires, contrats, factures, paiements, cautions, gestion documentaire, notifications, rapports, tableaux de bord, utilisateurs, journal d'audit.

**Exclus (V1)** : visites immobilières, photos des biens, signature électronique, multi-agences, biens de tiers. Ces points alimentent la section 16 (Évolutions futures) avec : application mobile native, paiement en ligne, connexion comptabilité, portail locataire, notifications WhatsApp.

## Profils utilisateurs (rappel)

| Profil | Droits clés |
|---|---|
| Administrateur | Gestion complète, paramétrage, utilisateurs, sécurité |
| Gérant | Validations (contrats, révisions loyers, cautions, corrections paiements), états financiers, rapports |
| Gestionnaire locatif | Biens, locataires, contrats, factures, paiements |
| Consultation | Lecture seule |

## Structure du dépôt

```
.
├── CLAUDE.md
├── docs/
│   └── cahier-des-charges.md      # Référence — ne pas modifier
├── dossier/                        # Dossier de conception (livrable, validé)
│   ├── 00-journal-decisions.md
│   ├── 01-presentation-agence.md
│   ├── ...
│   ├── 16-evolutions-futures.md
│   └── DOSSIER-CONCEPTION-COMPLET.md / .docx
├── technique/                      # Cadrage technique du développement
│   └── 00-cadrage-technique.md
├── prisma/
│   └── schema.prisma                # Dérivé de dossier/10-mld.md
├── src/
│   ├── app/                          # Next.js App Router (pages + API routes)
│   ├── lib/                          # prisma.ts, auth.ts, permissions.ts, ...
│   └── types/
├── tests/
├── .github/workflows/                # CI/CD
└── .claude/skills/                   # Skills du projet
```

## Règles générales

- Tout le contenu produit (dossier de conception, commentaires de code) est en **français** ; noms de variables/fonctions en anglais (profil TECHNOLOGIE ET INNOVATION AFRIK).
- Diagrammes en **Mermaid** intégrés au Markdown (cas d'utilisation, processus BPMN-like, MCD/MLD en `erDiagram`).
- Citer la section du CDC ou la décision du journal en source de chaque exigence (ex. « CDC §8.1 », « D-027 »).
- Aucune donnée personnelle réelle dans les exemples : utiliser des données fictives.
- Toute règle métier codée (ex. `src/lib/permissions.ts`, moteur de facturation) doit rester traçable vers le dossier de conception (section 05 — règles RG-XX, section 14 — permissions). Ne jamais coder une règle qui contredit le dossier sans d'abord faire trancher et consigner la décision.
