---
name: redaction-livrables
description: Conventions de rédaction, de nommage et de format pour les livrables du dossier de conception CISSE MEDOUNE (fichiers Markdown, diagrammes Mermaid, journal de décisions, assemblage final, export PDF/DOCX). Utiliser ce skill avant de rédiger toute section du dossier ou lors de l'assemblage du document final.
---

# Conventions de rédaction des livrables

## Fichiers et nommage

Toutes les sections dans `dossier/`, numérotées :

```
dossier/
├── 00-journal-decisions.md
├── 01-presentation-agence.md
├── 02-contexte-objectifs.md
├── 03-analyse-besoins.md
├── 04-acteurs.md
├── 05-regles-gestion.md
├── 06-analyse-fonctionnelle.md
├── 07-cas-utilisation.md
├── 08-processus-metier.md
├── 09-mcd.md
├── 10-mld.md
├── 11-dictionnaire-donnees.md
├── 12-interfaces.md
├── 13-etats-rapports.md
├── 14-securite-profils.md
├── 15-cdcf.md
└── 16-evolutions-futures.md
```

## Gabarit d'une section

```markdown
# N. Titre de la section

> Statut : Brouillon | En validation | Validé le JJ/MM/AAAA
> Sources : CDC §X, §Y — Décisions : D-012, D-015

## N.1 ...
```

- Langue : français ; ton professionnel, phrases courtes.
- Chaque exigence ou règle citée renvoie à sa source (CDC §, ou décision D-XX du journal).
- Identifiants codifiés : RG-XX (règles), UC-XX (cas d'utilisation), EF-XX / ENF-XX (exigences), P-X (processus), ECR-XX (écrans), ETA-XX (états/rapports), D-XX (décisions).
- Montants en FCFA, format `1 250 000 FCFA`. Dates au format JJ/MM/AAAA.
- Données d'exemple fictives uniquement.

## Journal des décisions (`00-journal-decisions.md`)

Tableau tenu à jour à chaque validation :

| ID | Date | Étape | Question | Décision | Impact |
|---|---|---|---|---|---|
| D-001 | 28/07/2026 | 5 | Prorata 1er mois ? | Mois plein | RG-F0x, MCD facture |

## Diagrammes

Tout diagramme en **Mermaid**, intégré au Markdown :
- Cas d'utilisation : `flowchart` (acteurs → cas) — Mermaid n'a pas de type UC natif.
- Processus métier : `flowchart TD` avec couloirs simulés par `subgraph` (un par acteur), ou `sequenceDiagram` pour les échanges.
- MCD/MLD : `erDiagram`.
- États : `stateDiagram-v2` (statuts bien, contrat, facture, caution).

Chaque diagramme est suivi d'une description textuelle (accessibilité + impression).

## Assemblage final

À la clôture (toutes sections validées) :
1. Concaténer `01` → `16` avec page de garde (projet, client, version, date) et sommaire.
2. Générer `dossier/DOSSIER-CONCEPTION-COMPLET.md`.
3. Sur demande, convertir en DOCX (pandoc + modèle de référence) et/ou PDF ; vérifier le rendu des tableaux et diagrammes (exporter les Mermaid en SVG/PNG via `mmdc` si la cible ne les rend pas).

## Contrôles qualité avant de soumettre une section

- [ ] Toutes les questions de l'étape ont une réponse validée (ou un défaut CDC confirmé).
- [ ] Chaque affirmation a une source (CDC § ou D-XX).
- [ ] Les identifiants sont uniques et continus.
- [ ] Les diagrammes Mermaid compilent (syntaxe valide).
- [ ] Cohérence avec les sections déjà validées (pas de contradiction avec le journal).
