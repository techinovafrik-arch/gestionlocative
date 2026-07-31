# 12. Interfaces de l'application

## 12.1 Principes généraux

- **Charte graphique** : palette **bleu / orange**, logo CIMEC en attente (placeholder réservé dans l'en-tête, à intégrer dès réception) — D-032.
- **Langue** : français uniquement.
- **Navigation** : menu latéral fixe sur desktop et tablette ; sur smartphone, le menu latéral se replie en menu bas (accès rapide aux modules principaux) ou en menu burger pour les fonctions secondaires — D-033.
- **Responsive** : web responsive sur ordinateur, tablette, smartphone (CDC §4.1, §18.1).
- **Ergonomie** : priorité à la simplicité de saisie (formulaires courts, listes déroulantes pour les valeurs contrôlées — cf. section 11.16), retour visuel immédiat sur les actions (validation, erreur), cohérence des couleurs de statut (ex. vert = payé/libre, orange = en attente/partiel, rouge = impayé/en travaux).

## 12.2 Inventaire des écrans par module

| Module | Écrans |
|---|---|
| Authentification | Connexion, réinitialisation mot de passe |
| Tableau de bord | Tableau de bord principal (par profil) |
| Biens | Liste des biens (filtrable), fiche bien, création/modification bien |
| Locataires | Liste des locataires, fiche locataire, création/modification locataire |
| Contrats | Liste des contrats, fiche contrat, création contrat, écran de validation (gérant), historique des révisions de loyer |
| Facturation | Liste des factures, fiche facture (PDF), suivi des factures en attente |
| Paiements | Saisie d'un paiement, liste des paiements, écran de correction (gérant) |
| Quittances | Liste des quittances, quittance (PDF) |
| Cautions | Suivi des cautions, écran de clôture/solde de caution (gérant) |
| Documents | Liste des documents rattachés à une fiche, ajout de référence document |
| Notifications | Centre de notifications interne |
| Rapports | Écran de génération de rapport (filtres), export |
| Utilisateurs | Liste des utilisateurs, création/modification compte, attribution de profil |
| Journal d'audit | Consultation du journal (filtrable par utilisateur, date, entité) |

## 12.3 Description des écrans clés

### Connexion
- **Objectif** : authentifier l'utilisateur.
- **Contenu** : email, mot de passe, lien « mot de passe oublié ».
- **Actions** : se connecter.
- **Profils** : tous.

### Tableau de bord principal
- **Objectif** : donner une vue de pilotage synthétique.
- **Contenu** : indicateurs clés (taux d'occupation, impayés, chiffre d'affaires du mois), alertes (contrats à échéance, cautions, biens vacants), graphiques (CDC §16.9).
- **Actions** : filtrer par période/bien/quartier, accéder aux détails.
- **Profils** : tous (contenu adapté — Consultation en lecture seule sur les données de loyers).

### Liste des biens
- **Objectif** : consulter et retrouver un bien.
- **Contenu** : tableau filtrable (code, type, quartier, statut, loyer).
- **Actions** : créer, consulter, modifier (selon profil).
- **Profils** : Administrateur, Gestionnaire locatif (gestion) ; Gérant, Consultation (lecture).

### Fiche bien / Création-modification bien
- **Objectif** : consulter ou saisir les informations d'un bien.
- **Contenu** : champs RG-B04 (code, type, description, commune, quartier, adresse, loyer, charges), statut, historique d'occupation.
- **Actions** : enregistrer, changer le statut.
- **Profils** : Administrateur, Gestionnaire locatif (édition) ; autres (lecture).

### Fiche locataire / Création-modification locataire
- **Objectif** : consulter ou saisir une fiche locataire.
- **Contenu** : type (physique/entreprise), identification (RG-L02), pièces d'identité (RG-L03), historique locatif.
- **Actions** : enregistrer, archiver.
- **Profils** : Administrateur, Gestionnaire locatif (édition) ; autres (lecture).

### Création contrat
- **Objectif** : créer un nouveau contrat de location.
- **Contenu** : sélection bien (libres uniquement) et locataire, dates, loyer, charges, caution (2 mois proposés par défaut — RG-K04), avance, périodicité.
- **Actions** : enregistrer en brouillon, soumettre à validation.
- **Profils** : Gestionnaire locatif (création), Administrateur.

### Validation contrat (gérant)
- **Objectif** : valider ou refuser un contrat soumis.
- **Contenu** : détail du contrat, aperçu PDF.
- **Actions** : valider (active le contrat, passe le bien à « Occupé »), refuser (avec motif).
- **Profils** : Gérant uniquement.

### Liste / fiche facture
- **Objectif** : consulter les factures émises.
- **Contenu** : numéro, contrat, période, montants, statut (RG-F02).
- **Actions** : télécharger PDF, envoyer par email, consulter le détail des paiements associés.
- **Profils** : tous en lecture ; Gestionnaire locatif en gestion.

### Saisie d'un paiement
- **Objectif** : enregistrer un règlement.
- **Contenu** : facture(s) due(s) du locataire (la plus ancienne mise en avant — RG-P06), montant, mode (RG-P02), référence.
- **Actions** : enregistrer (déclenche la quittance).
- **Profils** : Gestionnaire locatif, Administrateur.

### Correction paiement (gérant)
- **Objectif** : corriger un paiement erroné.
- **Contenu** : paiement initial, motif de correction, nouveau montant/mode.
- **Actions** : valider la correction.
- **Profils** : Gérant uniquement.

### Clôture / solde de caution (gérant)
- **Objectif** : décider du sort de la caution à la sortie du locataire.
- **Contenu** : montant initial, motifs de retenue éventuels, montant à rembourser.
- **Actions** : valider remboursement intégral ou avec retenue.
- **Profils** : Gérant uniquement.

### Centre de notifications
- **Objectif** : consulter les alertes et informations.
- **Contenu** : liste des notifications (type, canal, statut lu/non lu).
- **Actions** : marquer comme lue, accéder à l'élément concerné.
- **Profils** : tous (contenu personnalisé par utilisateur).

### Génération de rapport
- **Objectif** : produire un rapport filtré.
- **Contenu** : filtres (période, bien, quartier, type de rapport), aperçu.
- **Actions** : générer, exporter PDF/Excel, imprimer (RG-X02).
- **Profils** : Administrateur, Gérant (génération) ; autres (lecture selon droits).

### Gestion des utilisateurs
- **Objectif** : administrer les comptes.
- **Contenu** : liste des utilisateurs, profil, statut actif/inactif.
- **Actions** : créer, modifier, désactiver, réinitialiser mot de passe.
- **Profils** : Administrateur uniquement.

### Journal d'audit
- **Objectif** : tracer les opérations sensibles.
- **Contenu** : utilisateur, date/heure, action, entité, ancienne/nouvelle valeur.
- **Actions** : filtrer, consulter.
- **Profils** : Administrateur, Gérant.

## 12.4 Maquette basse fidélité — exemple (Tableau de bord, desktop)

```
┌──────────────┬───────────────────────────────────────────────────┐
│  [LOGO CIMEC]│  Tableau de bord               🔔 Notifications  👤 │
│              ├───────────────────────────────────────────────────┤
│ ▸ Tableau de │  ┌───────────┐ ┌───────────┐ ┌───────────┐         │
│   bord       │  │ Occupation│ │ Impayés   │ │ CA du mois│         │
│ ▸ Biens      │  │   85 %    │ │  4 dossiers│ │ 6 200 000 │        │
│ ▸ Locataires │  └───────────┘ └───────────┘ └───────────┘  FCFA   │
│ ▸ Contrats   │                                                     │
│ ▸ Factures   │  ┌─────────────────────────────┐ ┌───────────────┐ │
│ ▸ Paiements  │  │ Graphique occupation/quartier│ │ Alertes       │ │
│ ▸ Cautions   │  │                               │ │ - 3 contrats  │ │
│ ▸ Documents  │  └─────────────────────────────┘ │   à échéance  │ │
│ ▸ Rapports   │                                    │ - 2 cautions  │ │
│ ▸ Utilisateurs│                                   └───────────────┘ │
│ ▸ Audit      │                                                     │
└──────────────┴───────────────────────────────────────────────────┘
```

## 12.5 Maquette basse fidélité — exemple (smartphone)

```
┌───────────────────────┐
│ ☰   CIMEC        🔔 👤 │
├───────────────────────┤
│  Occupation : 85 %     │
│  Impayés : 4           │
│  CA du mois : 6 200 000│
├───────────────────────┤
│  [Graphique]           │
├───────────────────────┤
│  Alertes               │
│  - 3 contrats échéance │
│  - 2 cautions          │
├───────────────────────┤
│ 🏠   👤   📄   💰   ☰   │
│Biens Loc. Contr. Paie. │
└───────────────────────┘
```

Menu bas avec accès direct aux modules les plus utilisés (Biens, Locataires, Contrats, Paiements) ; menu burger (☰) pour les modules secondaires (Documents, Rapports, Utilisateurs, Audit).
