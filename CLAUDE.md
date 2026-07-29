# CLAUDE.md — Application de Gestion Locative — Agence CISSE MEDOUNE

## Contexte du projet

Conception puis développement d'une application web de gestion locative immobilière pour l'agence **CISSE MEDOUNE** (Abidjan, Côte d'Ivoire). L'agence gère son propre patrimoine (biens non meublés : maisons, villas, appartements, studios, chambres, bureaux, magasins, entrepôts, terrains, immeubles, locaux commerciaux) réparti dans plusieurs quartiers d'Abidjan (Treichville, Zone IV, Zone III...).

Le document de référence est `docs/cahier-des-charges.md` (version 1.0, juillet 2026). **Toute décision de conception doit être traçable vers une exigence du cahier des charges.** En cas d'ambiguïté ou de silence du CDC : poser la question au client, ne jamais inventer.

## Phase actuelle : CONCEPTION

Nous produisons le **dossier de conception** avant tout développement. Le dossier comprend 16 sections :

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

Utiliser le skill `conception-dossier` qui détaille, pour chaque section, les questions à poser et le plan de rédaction attendu.

## Skills du projet

- `conception-dossier` — workflow étape par étape du dossier de conception (questions, validation, plan de chaque section).
- `regles-metier` — règles de gestion extraites du CDC (source de vérité métier : facturation le 25, validations du gérant, archivage 1 an, etc.).
- `modele-donnees` — base pour le MCD/MLD/dictionnaire : entités, relations et attributs identifiés dans le CDC.
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
├── dossier/                        # Dossier de conception (livrable)
│   ├── 00-journal-decisions.md
│   ├── 01-presentation-agence.md
│   ├── ...
│   └── 16-evolutions-futures.md
└── .claude/skills/                 # Skills du projet
```

## Règles générales

- Tout le contenu produit est en **français**.
- Diagrammes en **Mermaid** intégrés au Markdown (cas d'utilisation, processus BPMN-like, MCD/MLD en `erDiagram`).
- Citer la section du CDC en source de chaque exigence (ex. « CDC §8.1 »).
- Aucune donnée personnelle réelle dans les exemples : utiliser des données fictives.
- La phase de développement ne démarre qu'après validation complète du dossier de conception.
