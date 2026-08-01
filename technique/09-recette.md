# Recette — Sprint 9

> Rapport de recette technique (avant recette client). Vérifie chaque
> exigence de `dossier/15-cdcf.md` (EF-01 à EF-32, ENF-01 à ENF-09) contre
> les critères de réception du CDC §21. Complète les tests automatisés
> (`tests/unit`, `tests/integration`) par un scénario de bout en bout réel
> (HTTP, cycle de vie complet) — les tests d'intégration vérifient chaque
> fonction `src/lib/*` isolément et bypassent la couche permissions/API ; ce
> scénario vérifie le câblage réel (routes, session, matrice de droits).

## 1. Scénario de bout en bout exécuté

Exécuté le 01/08/2026 contre l'application en local (`npm run dev`), avec les
3 profils métier (gestionnaire, gérant, administrateur) connectés via
`/api/auth/callback/credentials` (cookies réels, pas de mock de session) :

1. Gestionnaire crée un bien (EF-01) → statut `libre`.
2. Gestionnaire crée un locataire physique avec pièce d'identité (EF-04).
3. Gestionnaire crée un contrat (EF-07) → statut `brouillon`, bien toujours
   `libre` (EF-02 : pas de changement avant validation).
4. Notification interne créée pour le Gérant (EF-24).
5. Gérant valide le contrat (EF-08) → contrat `actif`, bien `occupé` (EF-02).
6. Téléchargement du contrat PDF (EF-09).
7. Déclenchement du cron facturation (EF-13) → une facture générée, montant
   = loyer plein sans prorata (EF-14, premier mois).
8. Paiement partiel (EF-17) → solde recalculé, quittance générée
   automatiquement (EF-20).
9. Téléchargement quittance PDF et facture PDF (EF-16, EF-20).
10. Paiement complémentaire soldant la facture (EF-17, EF-18 — imputation
    automatique sur la facture, pas de sélection manuelle par l'agent).
11. Correction d'un paiement : refusée pour le Gestionnaire (403), acceptée
    pour le Gérant (EF-19, RG-U02).
12. Clôture du contrat par le Gestionnaire (EF-12, UC-08) → contrat
    `résilié`, bien repasse `libre` (EF-02).
13. Décision de caution par le Gérant : retenue motivée, refusée pour le
    Gestionnaire (403) (EF-22, RG-K02/K03).
14. Historique d'occupation du bien et historique locatif du locataire
    exportés en Excel (EF-03, EF-06).
15. Rattachement d'un document (état des lieux) au contrat (EF-23).
16. Archivage du locataire sorti (EF-05).
17. Crons relances, renouvellement tacite, rapport mensuel déclenchés sans
    erreur (EF-25, EF-11, EF-26 — canaux externes toujours en stub, cf.
    point ouvert notifications).
18. Tableau de bord et graphiques reflètent les nouvelles données (EF-27,
    EF-28).
19. Journal d'audit : chaque étape sensible ci-dessus y apparaît (EF-31).

Données de test nettoyées de la base dev après exécution (aucune trace en
base au-delà du journal d'audit, conservé par nature).

## 2. Anomalie détectée et corrigée

**Le Gestionnaire locatif n'avait aucun accès en lecture aux contrats**
(`GET /api/contrats`, PDF du contrat, page `/contrats`) : la matrice
`src/lib/permissions.ts` ne lui accordait que `creer`/`modifier`, alors que
`dossier/14-securite-profils.md §14.1` (« Contrats — consulter | L | L | L |
L ») accorde la lecture aux 4 profils. Conséquence réelle : le lien
« Contrats » n'apparaissait même pas dans le menu du Gestionnaire, qui est
pourtant l'utilisateur principal au quotidien (CDC §1 : agence organisée
autour d'un Gestionnaire actif). Repéré en étape 6 du scénario ci-dessus
(téléchargement du PDF contrat par le Gestionnaire → 403 inattendu).

**Corrigé** : `contrats: { gestionnaire: ["creer", "modifier", "lire"], ... }`
dans `src/lib/permissions.ts`. Test de non-régression ajouté :
`tests/unit/permissions.test.ts` (« autorise le gestionnaire locatif à
consulter les contrats »). Vérifié à nouveau en direct après correction
(200 sur les 3 points d'entrée précédemment bloqués).

Aucune autre incohérence trouvée en comparant systématiquement chaque ligne
de `src/lib/permissions.ts` à `dossier/14-securite-profils.md §14.1`.

## 3. Suivi par exigence

Sources de vérification : **Auto** = test automatisé référencé, **E2E** =
étape du scénario de bout en bout ci-dessus, **Sprint N** = déjà vérifié
manuellement lors du sprint concerné (rapporté dans `technique/STATE.md`).

### Exigences fonctionnelles

| Réf. | Exigence | Vérification | Statut |
|---|---|---|---|
| EF-01 | Créer/modifier/consulter un bien | E2E (étape 1), `tests/integration/biens.test.ts` | ✅ |
| EF-02 | Bien Occupé/Libre automatique | E2E (étapes 3, 5, 12) | ✅ |
| EF-03 | Historique d'occupation d'un bien | E2E (étape 14) | ✅ |
| EF-04 | Fiche locataire physique/entreprise + pièce | E2E (étape 2), `tests/integration/locataires.test.ts` | ✅ |
| EF-05 | Archivage locataire + purge 1 an | E2E (étape 16, archivage) ; purge automatique après 1 an non rejouable en recette (dépend du temps réel) — mécanisme identique au pattern cron idempotent des autres purges, à confirmer en production après un an d'exploitation | ⚠️ voir note |
| EF-06 | Historique locatif d'un locataire | E2E (étape 14) | ✅ |
| EF-07 | Créer un contrat (bien libre + locataire actif) | E2E (étape 3), `tests/integration/contrats.test.ts` | ✅ |
| EF-08 | Valider/activer un contrat (Gérant) | E2E (étape 5) | ✅ |
| EF-09 | PDF contrat (2 trames) | E2E (étape 6) ; trame commerciale vérifiée Sprint 2 | ✅ |
| EF-10 | Révision de loyer + validation | Sprint 2, `tests/integration/contrats.test.ts` | ✅ |
| EF-11 | Renouvellement tacite | E2E (étape 17, pas de crash) ; logique dédiée testée Sprint 3 | ✅ |
| EF-12 | Clôture contrat + solde caution | E2E (étapes 12-13) | ✅ |
| EF-13 | Génération auto des factures | E2E (étape 7), `tests/integration/facturation.test.ts` | ✅ |
| EF-14 | Mois plein sans prorata | E2E (étape 7 : 150 000 FCFA, pas de prorata) | ✅ |
| EF-15 | Facture globale trimestrielle/annuelle | `tests/integration/facturation.test.ts` (non rejoué en E2E — contrat de recette mensuel) | ✅ |
| EF-16 | Consulter/télécharger/envoyer une facture | E2E (étape 9, téléchargement) ; envoi email = canal stub (cf. points ouverts) | ✅ (envoi réel différé) |
| EF-17 | Paiement total/partiel | E2E (étapes 8, 10) | ✅ |
| EF-18 | Imputation sur la facture la plus ancienne | E2E (étape 10) ; cas multi-factures testé `tests/integration/paiements.test.ts` | ✅ |
| EF-19 | Correction de paiement + validation Gérant | E2E (étape 11 : 403 puis 200) | ✅ |
| EF-20 | Quittance PDF automatique | E2E (étapes 8-9) | ✅ |
| EF-21 | Caution 2 mois par défaut, modifiable | E2E (étape 3 : 300 000 = 2×150 000) | ✅ |
| EF-22 | Solder une caution (remboursement/retenue) | E2E (étape 13) | ✅ |
| EF-23 | Rattacher un document (lien Drive) | E2E (étape 15) | ✅ |
| EF-24 | Centre de notifications interne | E2E (étape 4) | ✅ |
| EF-25 | Alertes échéance/impayés (email/SMS/WhatsApp) | E2E (étape 17, pas de crash) ; envoi réel = stub, fournisseurs non choisis (points ouverts 1-3) | ⚠️ stub |
| EF-26 | Rapport mensuel automatique | E2E (étape 17) | ✅ |
| EF-27 | Tableau de bord (indicateurs) | E2E (étape 18) | ✅ |
| EF-28 | 4 graphiques obligatoires | E2E (étape 18) ; palette validée skill dataviz (Sprint 7) | ✅ |
| EF-29 | Rapports filtrables/exportables PDF/Excel | Sprint 7 (16 rapports) ; export PDF = impression navigateur (simplification documentée) | ✅ |
| EF-30 | Comptes utilisateurs, profil unique | Sprint 1, `tests/unit/permissions.test.ts` | ✅ |
| EF-31 | Journal d'audit sur opérations sensibles | E2E (étape 19, écran `/audit` Sprint 8) | ✅ |
| EF-32 | Import initial Excel | Sprint 8 (`tests/integration/import.test.ts`, vérification manuelle HTTP) | ✅ |

### Exigences non fonctionnelles

| Réf. | Exigence | Vérification | Statut |
|---|---|---|---|
| ENF-01 | Responsive PC/tablette/smartphone | Tailwind CSS, classes responsives sur tous les écrans ; **non testé sur device physique** — à confirmer en recette client | ⚠️ à confirmer |
| ENF-02 | HTTPS obligatoire | Dépend du VPS/reverse proxy (Nginx + Let's Encrypt) — non actif en local par nature ; voir `technique/10-deploiement.md` | ⏳ bloqué VPS |
| ENF-03 | Mots de passe hachés, politique 8+maj+chiffre | E2E (rejet serveur d'un mot de passe sans majuscule), bcrypt (`src/lib/auth.ts`) | ✅ |
| ENF-04 | Déconnexion après 30 min d'inactivité | Sprint 8 (cookie `Expires` = connexion + 30 min, vérifié) | ✅ |
| ENF-05 | Sauvegardes quotidiennes, rétention 30 j | Sprint 8 (`scripts/sauvegarde.sh`/`restauration.sh` testés localement) ; cron production à activer, voir `technique/10-deploiement.md` | ✅ (activation en attente VPS) |
| ENF-06 | VPS Linux Ubuntu 4 Go RAM min. | Non provisionné (point ouvert #4) | ⏳ bloqué |
| ENF-07 | Performance à 70 biens/locataires, 80-90 factures/mois, 5 sessions | Volumétrie cible non testée en charge réelle (pas d'environnement de charge disponible) ; requêtes indexées (`@@index` sur factures, paiements, audits, documents) | ⚠️ non chargé |
| ENF-08 | FCFA sans décimales | E2E (recherche de décimales dans les montants affichés : aucune) | ✅ |
| ENF-09 | Pas de fichier binaire en base | Schéma Prisma : `documents.lien_securise` (VARCHAR), aucune colonne binaire | ✅ |

## 4. Synthèse

- **27 exigences Must** : toutes conformes, sauf celles bloquées par une
  décision externe non encore prise (VPS — ENF-02, ENF-06 ; fournisseurs
  notifications — EF-25 partiel) ou par nature non rejouables en recette
  interne (ENF-07 charge réelle, ENF-01 device physique, EF-05 purge à 1 an).
- **10 exigences Should** : toutes conformes.
- **1 anomalie** trouvée et corrigée (permissions Gestionnaire/Contrats).
- Suite automatisée : 12 tests unitaires, 46 tests d'intégration,
  `typecheck`/`lint`/`build` propres.

## 5. Ce qui reste conditionné à une décision de l'agence

Repris de `technique/00-cadrage-technique.md §6` (aucun changement) :

1. Fournisseur SMS.
2. Fournisseur WhatsApp Business API.
3. Fournisseur email transactionnel.
4. VPS de production.
5. Compte Google Drive professionnel (sans impact technique — saisie
   manuelle des liens).

Tant que 1-3 ne sont pas tranchés, EF-25/EF-16 (envoi réel) restent en stub
fonctionnel (aucun échec silencieux, juste aucun envoi réel — cf.
`src/lib/notifications/canaux.ts`). Tant que 4 n'est pas tranché, ENF-02,
ENF-06 et l'activation d'ENF-05 restent en attente — voir
`technique/10-deploiement.md` pour la procédure prête à exécuter dès le VPS
disponible.
