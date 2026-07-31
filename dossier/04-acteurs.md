# 04. Acteurs du système

## 4.1 Acteurs humains

Le système gère **quatre profils** (CDC §13.1). Chaque compte utilisateur porte **un seul profil** (pas de cumul, D-013). Le locataire n'est **pas** un acteur direct du système en V1 — l'accès locataire (portail) est une évolution future (CDC §3.2, §22 ; section 16).

### Administrateur

| | |
|---|---|
| Effectif actuel | 1 personne |
| Responsabilités | Gestion complète de l'application, paramétrage, gestion des utilisateurs, sécurité (CDC §13.1) |
| Fréquence d'usage | Ponctuelle (paramétrage, administration des comptes) |

### Gérant

| | |
|---|---|
| Effectif actuel | 1 personne |
| Responsabilités | Validation des opérations sensibles (activation de contrat, révision de loyer, retenue et remboursement de caution, correction de paiement), consultation des états financiers et rapports (CDC §13.1, §14) |
| Fréquence d'usage | Régulière (validations, suivi financier) |

### Gestionnaire locatif

| | |
|---|---|
| Effectif actuel | 1 personne (Gestionnaire actif) |
| Responsabilités | Gestion opérationnelle : biens, locataires, contrats, factures, paiements (CDC §13.1) |
| Fréquence d'usage | Quotidienne — utilisateur principal de l'application |

### Consultation

| | |
|---|---|
| Effectif actuel | 2 personnes (Comptable, Superviseur) |
| Responsabilités | Lecture seule (CDC §13.1) ; accès aux données de loyers pour le Comptable et le Superviseur (D-006) |
| Fréquence d'usage | Régulière (suivi comptable et supervision) |

## 4.2 Acteurs systèmes

| Acteur système | Rôle |
|---|---|
| Planificateur de facturation | Génère automatiquement les factures mensuelles à date fixe (CDC §17.4) |
| Service de notifications / email | Envoie les alertes échéances, impayés, contrats, cautions et les notifications par email (CDC §17.2, §17.3) |
| Google Drive | Stockage des documents ; l'application ne conserve que la référence, le type et le lien sécurisé (CLAUDE.md, CDC §12) |

## 4.3 Matrice acteurs × modules

| Module | Administrateur | Gérant | Gestionnaire locatif | Consultation |
|---|---|---|---|---|
| Biens | Gestion complète | Consultation | Gestion | Lecture |
| Locataires | Gestion complète | Consultation | Gestion | Lecture |
| Contrats | Gestion complète | Validation | Gestion (création) | Lecture |
| Factures | Gestion complète | Consultation | Gestion | Lecture |
| Paiements | Gestion complète | Validation (corrections) | Gestion | Lecture |
| Cautions | Gestion complète | Validation (retenue/remboursement) | Gestion (suivi) | Lecture |
| Gestion documentaire | Gestion complète | Consultation | Gestion | Lecture |
| Notifications | Paramétrage | Réception | Réception | Réception (selon périmètre) |
| Rapports | Gestion complète | Consultation | Consultation | Lecture |
| Tableaux de bord | Consultation | Consultation | Consultation | Lecture |
| Utilisateurs | Gestion complète | — | — | — |
| Journal d'audit | Consultation | Consultation | — | — |

*Cette matrice sera affinée à l'étape 6 (Analyse fonctionnelle) et à l'étape 14 (Sécurité et profils) avec le détail CRUD par fonction.*
