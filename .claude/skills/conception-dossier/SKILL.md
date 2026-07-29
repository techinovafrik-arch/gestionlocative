---
name: conception-dossier
description: Workflow étape par étape pour produire le dossier de conception de l'application de gestion locative CISSE MEDOUNE. Utiliser ce skill dès que l'utilisateur demande de démarrer, reprendre ou poursuivre la conception, de rédiger une section du dossier, ou de poser les questions d'une étape. Contient pour chacune des 16 sections les questions indispensables à poser et le plan de rédaction attendu.
---

# Dossier de conception — Workflow

## Règle d'or

Pour chaque section, dans l'ordre :

1. Annoncer l'étape en cours et son objectif.
2. Poser **uniquement les questions indispensables** (celles listées ci-dessous, moins celles déjà tranchées par le CDC ou une décision antérieure du journal). Pour chaque question, proposer la réponse par défaut du CDC si elle existe.
3. Attendre les réponses. Reformuler et demander **validation explicite**.
4. Rédiger la section dans `dossier/NN-nom.md` selon le plan indiqué.
5. Enregistrer les décisions dans `dossier/00-journal-decisions.md`.
6. Soumettre la section à validation. Ne passer à la suivante qu'après accord.

Avant de démarrer : vérifier l'état de `dossier/` pour reprendre où on s'était arrêté (dernière section validée dans le journal).

---

## Étape 1 — Présentation de l'agence → `01-presentation-agence.md`

**Questions indispensables** (le CDC est muet sur la plupart) :
- Forme juridique, date de création, effectif de l'agence ?
- Coordonnées officielles (adresse siège, téléphone, email) ?
- Taille approximative du patrimoine (nombre de biens par catégorie) ?
- Organisation interne actuelle (qui fait quoi aujourd'hui) ?

**Plan** : identité de l'agence · activité et patrimoine · organisation · positionnement du projet.

## Étape 2 — Contexte et objectifs → `02-contexte-objectifs.md`

**Défaut CDC** : contexte §1.1, problématique §1.2, objectif général §1.3, objectifs spécifiques §2.
**Questions** :
- Outils actuels (Excel, papier, autre logiciel) et principaux points de douleur vécus ?
- Indicateurs de succès attendus (ex. réduction des impayés, gain de temps) ?
- Échéance souhaitée de mise en production ?

**Plan** : contexte · problématique · objectif général · objectifs spécifiques (5 domaines : immobilier, locataires, contrats, finance, pilotage) · indicateurs de succès.

## Étape 3 — Analyse des besoins → `03-analyse-besoins.md`

**Défaut CDC** : périmètre §3 (inclus/exclus).
**Questions** :
- Volumétrie estimée : nb biens, nb locataires actifs, nb factures/mois, nb utilisateurs simultanés ?
- Besoins de reprise de données existantes (import initial) ?
- Contraintes de connectivité (usage hors-ligne nécessaire ?) — défaut : non, web uniquement.

**Plan** : besoins fonctionnels par module (12 modules du §3.1) · besoins non fonctionnels (performance, sécurité, disponibilité, ergonomie mobile) · exclusions V1 · contraintes.

## Étape 4 — Acteurs du système → `04-acteurs.md`

**Défaut CDC** : 4 profils (§13) + système (automatisations §17) + services externes (Google Drive, Email).
**Questions** :
- Combien de personnes par profil au démarrage ?
- Le locataire est-il un acteur direct du système en V1 ? (défaut CDC : non, le portail locataire est une évolution future)
- Un même utilisateur peut-il cumuler des profils ? (proposer : non, un profil unique par compte)

**Plan** : acteurs humains (fiche par profil : rôle, responsabilités, fréquence d'usage) · acteurs systèmes (planificateur de facturation, service email, Google Drive) · matrice acteurs × modules.

## Étape 5 — Règles de gestion → `05-regles-gestion.md`

**Défaut CDC** : voir le skill `regles-metier` (liste RG codifiée pré-extraite du CDC).
**Questions** (zones grises du CDC) :
- Facture de premier mois : prorata si entrée en cours de mois, ou mois plein ?
- Montant de la caution : règle standard (ex. n mois de loyer) ou libre par contrat ?
- Ordre d'imputation d'un paiement quand plusieurs factures sont dues (plus ancienne d'abord ?) ?
- Pénalités de retard : existantes ? (le CDC n'en mentionne pas — défaut : non)
- Date d'échéance de paiement : le 10 du mois (déduit de §17.5) — confirmer.
- Périodicité trimestrielle/annuelle : une seule facture globale ou factures mensuelles payées d'avance ?

**Plan** : règles codifiées RG-XX par domaine (biens, locataires, contrats, facturation, paiements, cautions, sécurité), chacune avec sa source (CDC §) ou sa décision (journal).

## Étape 6 — Analyse fonctionnelle → `06-analyse-fonctionnelle.md`

**Questions** :
- Priorisation des modules pour un éventuel découpage en lots (proposer : Lot 1 biens+locataires+contrats, Lot 2 facturation+paiements+cautions, Lot 3 reporting+notifications) ?

**Plan** : décomposition fonctionnelle (arborescence des fonctions par module) · matrice fonctions × profils (CRUD + valider) · dépendances entre modules · priorisation.

## Étape 7 — Cas d'utilisation → `07-cas-utilisation.md`

**Questions** : normalement aucune si étapes 4–6 validées ; confirmer la liste des cas retenus avant rédaction détaillée.

**Plan** : diagramme général Mermaid · liste des UC par acteur · fiches détaillées (UC-XX : acteur, préconditions, scénario nominal, alternatives, exceptions, postconditions) pour les cas majeurs au minimum : créer un bien, créer un locataire, créer/valider un contrat, générer les factures du 25, enregistrer un paiement (total/partiel), générer une quittance, réviser un loyer, clôturer un contrat et solder la caution, consulter le tableau de bord.

## Étape 8 — Processus métier → `08-processus-metier.md`

**Questions** :
- Circuit exact d'une entrée locataire (visite hors système → dossier → contrat → caution+avance → remise clés) : ordre et acteurs ?
- Circuit de sortie (préavis ? état des lieux ? délai de remboursement caution ?) — le CDC ne fixe pas de délais.
- Relances impayés : combien de niveaux, quels canaux, qui décide d'une action contentieuse ?

**Plan** : diagrammes Mermaid (flowchart) + description narrative pour : P1 mise en location, P2 cycle de facturation mensuel (le 25), P3 encaissement et quittance, P4 gestion des impayés, P5 renouvellement tacite, P6 sortie du locataire et caution, P7 révision de loyer.

## Étape 9 — MCD → `09-mcd.md`

**Défaut** : entités et relations du skill `modele-donnees` (issues du CDC §19).
**Questions** :
- Faut-il une entité PROPRIETAIRE ? (défaut CDC : non, l'agence est l'unique propriétaire)
- Les quartiers/communes sont-ils des tables de référence gérables par l'admin ? (proposer : oui)
- La quittance est-elle une entité distincte ou un document dérivé du paiement ? (proposer : entité, pour la numérotation)

**Plan** : diagramme Mermaid `erDiagram` · description de chaque entité · cardinalités justifiées · règles de gestion portées par le modèle.

## Étape 10 — MLD → `10-mld.md`

**Questions** : aucune nouvelle en principe ; confirmer les conventions (tables au singulier ou pluriel, préfixes, UUID vs serial — proposer : snake_case pluriel, clés `id` UUID, horodatages `created_at`/`updated_at`, suppression logique là où l'audit l'exige).

**Plan** : schéma relationnel complet (tables, PK, FK, contraintes UNIQUE/CHECK, index) · script SQL PostgreSQL de création en annexe.

## Étape 11 — Dictionnaire des données → `11-dictionnaire-donnees.md`

**Plan** : pour chaque table, tableau : champ, type PostgreSQL, longueur, obligatoire, valeur par défaut, règle/contrainte, source CDC. Inclure les listes de valeurs (statuts, types de biens, modes de paiement, types de pièces d'identité...).

## Étape 12 — Interfaces de l'application → `12-interfaces.md`

**Questions** :
- Charte : couleurs/logo de l'agence disponibles ?
- Langue unique français confirmée ?
- Navigation souhaitée : menu latéral (desktop) + menu bas ou burger (mobile) — proposer.

**Plan** : inventaire des écrans par module · description de chaque écran (objectif, contenu, actions, profils autorisés) · maquettes basse fidélité (wireframes ASCII/Mermaid ou HTML si demandé) · principes responsive et ergonomie.

## Étape 13 — États et rapports → `13-etats-rapports.md`

**Défaut CDC** : §16 (liste complète des rapports, filtres, graphiques) + documents PDF (§7.5 contrat, §8 facture, §10 quittance).
**Questions** :
- Mentions légales/fiscales obligatoires sur factures et quittances (NCC, RCCM, TVA applicable ?) ?
- Modèle de contrat existant à reproduire ?

**Plan** : fiche par état (contenu, filtres, formats PDF/Excel/impression, profil) · maquettes des documents PDF (contrat, facture, quittance) · tableau de bord et graphiques (§16.2, §16.9).

## Étape 14 — Sécurité et profils → `14-securite-profils.md`

**Défaut CDC** : §13, §14, §15, §18.5.
**Questions** :
- Politique de mots de passe (longueur min, expiration ?) — proposer un standard.
- Double authentification souhaitée ? (défaut : non en V1, évolution possible)
- Durée de session / déconnexion automatique ?
- Fréquence et rétention des sauvegardes ?

**Plan** : matrice détaillée permissions × profils · workflow des validations sensibles (§14) · journal d'audit (événements tracés, format) · sécurité technique (HTTPS, hash mots de passe, sauvegardes, RGPD-like : archivage 1 an et purge des locataires partis §6.4).

## Étape 15 — Cahier des charges fonctionnel → `15-cdcf.md`

Consolidation : reprendre les sections validées et produire les exigences numérotées EF-XX (fonctionnelles) et ENF-XX (non fonctionnelles) avec priorité (Must/Should/Could) et critères d'acceptation (aligner sur CDC §21).
**Question** : validation de la priorisation proposée.

## Étape 16 — Évolutions futures → `16-evolutions-futures.md`

**Défaut CDC** : §3.2 + §22 (mobile native, paiement en ligne, comptabilité, portail locataire, WhatsApp).
**Questions** : ordre de priorité souhaité et horizon indicatif pour chaque évolution ?

**Plan** : fiche par évolution (description, valeur, prérequis, impacts sur le modèle de données à anticiper dès la V1).

---

## Clôture

Après validation des 16 sections : proposer l'assemblage du dossier complet (un document unique avec sommaire, à partir des fichiers `dossier/*.md`) et sa conversion en PDF/DOCX si demandé, puis le passage en phase de développement.
