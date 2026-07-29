# CAHIER DES CHARGES

# CONCEPTION ET DÉVELOPPEMENT D'UNE APPLICATION WEB DE GESTION LOCATIVE IMMOBILIÈRE

## Projet :

# APPLICATION DE GESTION LOCATIVE

## Agence Immobilière CISSE MEDOUNE

## Version du document

  -----------------------------------------------------------------------
  Élément             Information
  ------------------- ---------------------------------------------------
  Document            Cahier des charges fonctionnel et technique

  Projet              Application web de gestion locative immobilière

  Client              Agence immobilière CISSE MEDOUNE

  Version             1.0

  Date                Juillet 2026

  Nature du projet    Développement logiciel sur mesure
  -----------------------------------------------------------------------

# 1. PRÉSENTATION DU PROJET

## 1.1 Contexte

L\'agence immobilière **CISSE MEDOUNE** assure la gestion locative de
son propre patrimoine immobilier composé de plusieurs catégories de
biens :

-   Maisons ;

-   Villas ;

-   Appartements ;

-   Studios ;

-   Chambres ;

-   Bureaux ;

-   Magasins ;

-   Entrepôts ;

-   Terrains ;

-   Immeubles ;

-   Locaux commerciaux.

Les biens immobiliers sont répartis principalement dans différents
quartiers d\'Abidjan, notamment :

-   Treichville ;

-   Zone IV ;

-   Zone III ;

-   autres quartiers selon le développement du patrimoine.

Les biens sont exclusivement des biens **non meublés** appartenant à
l\'agence.

# 1.2 Problématique actuelle

La gestion locative nécessite un suivi rigoureux de plusieurs domaines :

-   disponibilité des biens ;

-   contrats de location ;

-   échéances ;

-   facturation mensuelle ;

-   paiements ;

-   impayés ;

-   cautions ;

-   historique des locataires ;

-   reporting financier.

Afin d\'améliorer son efficacité opérationnelle, CISSE MEDOUNE souhaite
disposer d\'une solution informatique centralisée permettant
d\'automatiser et sécuriser l\'ensemble du processus de gestion
locative.

# 1.3 Objectif général

Développer une application web professionnelle permettant à l\'agence
immobilière CISSE MEDOUNE de gérer intégralement son patrimoine locatif
depuis une plateforme unique accessible sur :

-   ordinateur ;

-   tablette ;

-   smartphone.

# 2. OBJECTIFS SPÉCIFIQUES

L\'application devra permettre :

## Gestion immobilière

-   Enregistrer tous les biens ;

-   Identifier chaque bien par un code unique ;

-   Suivre leur disponibilité ;

-   Conserver l\'historique des occupations.

## Gestion locataires

-   Créer une fiche complète locataire ;

-   Gérer personnes physiques et entreprises ;

-   Conserver l\'historique locatif ;

-   Archiver temporairement les anciens locataires.

## Gestion contractuelle

-   Créer les contrats ;

-   Générer les contrats PDF ;

-   Suivre les renouvellements ;

-   Historiser les révisions de loyers.

## Gestion financière

-   Générer automatiquement les factures ;

-   Enregistrer les paiements ;

-   Gérer les paiements partiels ;

-   Produire les quittances ;

-   Suivre les impayés.

## Pilotage

-   Fournir des tableaux de bord ;

-   Générer des rapports ;

-   Faciliter les décisions du gérant.

# 3. PÉRIMÈTRE DU PROJET

## 3.1 Périmètre inclus

Le système devra intégrer :

✅ Gestion des biens\
✅ Gestion des locataires\
✅ Gestion des contrats\
✅ Gestion des factures\
✅ Gestion des paiements\
✅ Gestion des cautions\
✅ Gestion documentaire\
✅ Notifications\
✅ Rapports\
✅ Tableaux de bord\
✅ Gestion utilisateurs\
✅ Journal d\'audit

# 3.2 Fonctionnalités exclues

Les fonctionnalités suivantes ne sont pas prévues dans la première
version :

❌ Gestion des visites immobilières\
❌ Gestion des photos des biens\
❌ Signature électronique\
❌ Gestion multi-agences\
❌ Gestion de biens appartenant à des tiers

# 4. ARCHITECTURE GÉNÉRALE

## 4.1 Type d\'application

Application :

**Web responsive**

Compatible :

-   Ordinateur ;

-   Tablette ;

-   Smartphone.

## 4.2 Mode de développement

Solution :

**Développement sur mesure avec code source complet**

Le code source, la base de données et la documentation seront la
propriété de l'agence

# 5. GESTION DES BIENS IMMOBILIERS

## 5.1 Identification

Chaque bien possède :

-   Code unique automatique ou manuel ;

-   Désignation ;

-   Type ;

-   Localisation ;

-   Description ;

-   Loyer ;

-   Charges éventuelles ;

-   Statut.

## 5.2 Statuts possibles

Un bien peut être :

### Libre

Disponible à la location.

### Occupé

Associé à un contrat actif.

### En travaux

Indisponible temporairement.

## 5.3 Informations obligatoires

### Informations générales

-   Code bien ;

-   Type ;

-   Description.

### Localisation

-   Commune ;

-   Quartier ;

-   Adresse.

### Informations financières

-   Prix location ;

-   Charges mensuelles.

# 6. GESTION DES LOCATAIRES

## 6.1 Types de locataires

Le système devra gérer :

### Personnes physiques

Informations :

-   Civilité ;

-   Nom ;

-   Prénoms ;

-   Date naissance ;

-   Nationalité ;

-   Profession.

### Entreprises

Informations :

-   Raison sociale ;

-   Informations administratives ;

-   Représentant.

# 6.2 Identification locataire

Champs :

-   Code locataire ;

-   Téléphone principal ;

-   Téléphone secondaire ;

-   Email ;

-   Contact urgence.

# 6.3 Pièces d\'identité

Types :

-   Passeport ;

-   Carte nationale d\'identité ;

-   Carte consulaire ;

-   Permis de conduire.

Informations :

-   Type ;

-   Numéro ;

-   Date expiration.

# 6.4 Archivage

Lorsqu\'un locataire quitte un logement :

-   son historique est conservé ;

-   ses données personnelles sont archivées pendant 1 an ;

-   suppression automatique après expiration du délai.

# 7. GESTION DES CONTRATS DE LOCATION

## 7.1 Objectif du module

Le module contrat permet de gérer l\'ensemble du cycle de vie d\'une
location :

-   création ;

-   validation ;

-   exécution ;

-   renouvellement ;

-   modification ;

-   clôture.

# 7.2 Création d\'un contrat

Un contrat est obligatoirement lié :

-   à un bien immobilier ;

-   à un locataire.

Informations principales :

  -----------------------------------------------------------------------
  Champ                        Description
  ---------------------------- ------------------------------------------
  Numéro contrat               Référence unique

  Bien concerné                Bien loué

  Locataire                    Titulaire du contrat

  Date début                   Début location

  Date fin                     Fin prévue

  Montant loyer                Loyer contractuel

  Charges                      Charges éventuelles

  Caution                      Dépôt de garantie

  Avance sur loyer             Optionnelle

  Périodicité paiement         Mensuelle/Trimestrielle/Annuelle

  Statut                       Actif/Résilié/Terminé
  -----------------------------------------------------------------------

# 7.3 Durée des contrats

Règle de gestion :

La durée standard d\'un contrat est :

**1 année renouvelable par tacite reconduction**

Le système devra permettre :

-   renouvellement automatique ;

-   conservation de l\'ancien contrat ;

-   création d\'un historique.

# 7.4 Validation des contrats

La création d\'un contrat pourra être réalisée par le gestionnaire
locatif.

La validation finale appartient au :

**Gérant**

Après validation :

-   le contrat devient actif ;

-   le bien passe automatiquement au statut \"Occupé\" ;

-   la facturation devient possible.

# 7.5 Génération du contrat PDF

Le système devra générer automatiquement un contrat PDF comprenant :

## En-tête

-   Logo CISSE MEDOUNE ;

-   Coordonnées agence.

## Corps du contrat

-   Informations bailleur ;

-   Informations locataire ;

-   Désignation du bien ;

-   Conditions financières ;

-   Durée ;

-   Clauses principales.

## Signature

Zones prévues pour :

-   Bailleur ;

-   Locataire.

# 7.6 Révision des loyers

Le système autorise la révision d\'un loyer pendant la durée d\'un
contrat.

Informations conservées :

-   ancien montant ;

-   nouveau montant ;

-   date modification ;

-   motif ;

-   utilisateur ;

-   validation du gérant.

Historique obligatoire.

# 8. GESTION DE LA FACTURATION

# 8.1 Principe général

La facturation est mensuelle.

Le système doit générer automatiquement les factures :

## Date de génération :

**Le 25 de chaque mois**

Pour :

-   les contrats actifs ;

-   la période du mois suivant.

# 8.2 Exemple

Le 25 août 2026 :

Création automatique :

Facture septembre 2026

Pour :

-   Locataire ;

-   Bien concerné ;

-   Loyer ;

-   Charges éventuelles.

# 8.3 Informations obligatoires d\'une facture

Chaque facture doit contenir :

  -----------------------------------------------------------------------
  Champ                             Description
  --------------------------------- -------------------------------------
  Numéro facture                    Identifiant unique

  Date émission                     Date création

  Période concernée                 Mois facturé

  Locataire                         Client

  Bien                              Désignation logement

  Montant loyer                     Prix location

  Charges                           Si existantes

  Arriérés                          Retards éventuels

  Total à payer                     Montant global

  Montant payé                      Paiements reçus

  Solde restant                     Reste dû
  -----------------------------------------------------------------------

# 8.4 Paiement anticipé

Le système doit gérer plusieurs périodicités :

-   Mensuelle ;

-   Trimestrielle ;

-   Annuelle.

Cette option est activable selon le locataire.

# 8.5 Envoi des factures

Après génération :

La facture PDF pourra être :

-   consultée dans l\'application ;

-   téléchargée ;

-   envoyée par email au client.

# 9. GESTION DES PAIEMENTS

# 9.1 Objectif

Permettre l\'enregistrement complet des règlements locatifs.

# 9.2 Paiement en plusieurs tranches

Un locataire peut régler une facture :

-   en totalité ;

-   partiellement ;

-   en plusieurs versements.

Le système devra calculer automatiquement :

-   montant payé ;

-   reste à payer ;

-   état de la facture.

# 9.3 Moyens de paiement acceptés

Le système devra gérer :

-   Espèces ;

-   Virement bancaire ;

-   Chèque ;

-   Orange Money ;

-   MTN Money ;

-   Moov Money ;

-   Wave.

# 9.4 Paiement en espèces

Le gestionnaire pourra enregistrer :

-   montant reçu ;

-   date ;

-   locataire ;

-   facture concernée ;

-   utilisateur ayant encaissé.

# 9.5 Historique des transactions

Chaque transaction doit conserver :

-   référence ;

-   date ;

-   montant ;

-   mode paiement ;

-   utilisateur ;

-   facture associée.

# 10. GÉNÉRATION DES QUITTANCES

Après validation d\'un paiement :

Le système génère automatiquement :

## Quittance PDF

Contenu :

-   Logo CISSE MEDOUNE ;

-   Numéro quittance ;

-   Date ;

-   Locataire ;

-   Bien concerné ;

-   Période ;

-   Montant payé ;

-   Mode paiement.

# 11. GESTION DES DÉPÔTS DE GARANTIE (CAUTIONS)

# 11.1 Principe

Une caution est exigée lors de la signature du contrat.

Elle est :

-   enregistrée ;

-   suivie ;

-   remboursable au départ.

# 11.2 Gestion pendant le contrat

Le système conserve :

-   montant initial ;

-   date versement ;

-   contrat associé.

# 11.3 Départ du locataire

À la sortie :

La caution peut être :

## Option 1

Remboursement intégral.

## Option 2

Remboursement avec retenue.

Motifs possibles :

-   dommages ;

-   réparations ;

-   sommes dues.

# 11.4 Validation

La décision appartient au :

**Gérant**

Informations conservées :

-   montant retenu ;

-   motif ;

-   montant remboursé ;

-   date remboursement ;

-   validateur.

# 12. GESTION DOCUMENTAIRE

## 12.1 Principe retenu

Les documents seront stockés sur une plateforme externe :

**Google Drive professionnel ou équivalent**

L\'application conservera uniquement :

-   référence ;

-   type document ;

-   lien sécurisé ;

-   association métier.

# 12.2 Documents concernés

## Biens

-   Documents administratifs.

## Locataires

-   Pièces d\'identité ;

-   Documents justificatifs.

## Contrats

-   Contrats PDF ;

-   Avenants.

## Finance

-   Factures ;

-   Quittances ;

-   Justificatifs paiement.

# 13. GESTION DES UTILISATEURS

## 13.1 Profils utilisateurs

Le système devra gérer quatre profils.

## Administrateur

Droits :

-   Gestion complète ;

-   Paramétrage ;

-   Utilisateurs ;

-   Sécurité.

## Gérant

Droits :

-   Validation contrats ;

-   Validation révisions loyers ;

-   Validation cautions ;

-   États financiers ;

-   Rapports.

## Gestionnaire locatif

Droits :

-   Gestion biens ;

-   Gestion locataires ;

-   Contrats ;

-   Factures ;

-   Paiements.

## Consultation

Droits :

-   Lecture uniquement.

# 14. VALIDATION DES OPÉRATIONS SENSIBLES

Les opérations suivantes nécessitent validation :

  -----------------------------------------------------------------------
  Opération                                        Validateur
  ------------------------------------------------ ----------------------
  Activation contrat                               Gérant

  Révision loyer                                   Gérant

  Retenue caution                                  Gérant

  Remboursement caution                            Gérant

  Correction paiement                              Gérant
  -----------------------------------------------------------------------

# 15. JOURNAL D\'AUDIT

Toutes les opérations sensibles doivent être tracées.

Informations :

-   utilisateur ;

-   date ;

-   heure ;

-   action ;

-   ancienne valeur ;

-   nouvelle valeur.

Exemples :

-   modification loyer ;

-   suppression ;

-   validation ;

-   remboursement.

# 16. RAPPORTS ET TABLEAUX DE BORD

## 16.1 Objectif du module

Le module de reporting doit permettre au gérant de disposer d\'une
vision complète de l\'activité immobilière et financière de l\'agence.

Les rapports devront être :

-   consultables en ligne ;

-   exportables en PDF ;

-   exportables en Excel ;

-   imprimables directement.

# 16.2 Tableau de bord principal

Le tableau de bord devra présenter les indicateurs clés sous forme
graphique.

## Indicateurs immobiliers

Affichage :

-   Nombre total de biens ;

-   Nombre de biens occupés ;

-   Nombre de biens libres ;

-   Nombre de biens en travaux ;

-   Taux d\'occupation du patrimoine.

## Indicateurs financiers

Affichage :

-   Loyers attendus du mois ;

-   Loyers encaissés ;

-   Factures impayées ;

-   Paiements partiels ;

-   Chiffre d\'affaires mensuel ;

-   Chiffre d\'affaires trimestriel ;

-   Chiffre d\'affaires annuel.

## Indicateurs locatifs

Affichage :

-   Nombre de locataires actifs ;

-   Nouveaux contrats ;

-   Contrats arrivant à échéance ;

-   Départs récents.

# 16.3 Rapports immobiliers

## Rapport : Liste des biens

Informations :

-   Code bien ;

-   Type de bien ;

-   Désignation ;

-   Localisation ;

-   Loyer ;

-   Charges ;

-   Statut.

Filtres :

-   Type ;

-   Quartier ;

-   Disponibilité.

## Rapport : Biens disponibles

Objectif :

Identifier les biens non occupés.

Informations :

-   Code bien ;

-   Type ;

-   Quartier ;

-   Date de disponibilité ;

-   Durée de vacance.

## Rapport : Biens occupés

Informations :

-   Bien ;

-   Locataire ;

-   Contrat actif ;

-   Loyer ;

-   Date début occupation.

## Rapport : Historique des occupations

Pour chaque bien :

-   Liste des locataires successifs ;

-   Dates d\'entrée ;

-   Dates de sortie ;

-   Contrats associés.

# 16.4 Rapports locataires

## Liste des locataires actifs

Informations :

-   Code locataire ;

-   Nom ;

-   Téléphone ;

-   Bien occupé ;

-   Date contrat.

## Historique locataire

Consultation :

-   anciens logements ;

-   contrats ;

-   paiements ;

-   incidents financiers.

# 16.5 Rapports contrats

## Contrats arrivant à échéance

Filtres :

-   30 jours ;

-   60 jours ;

-   90 jours.

Informations :

-   Numéro contrat ;

-   Locataire ;

-   Bien ;

-   Date expiration ;

-   Statut renouvellement.

# 16.6 Rapports financiers

## Factures émises

Informations :

-   Numéro facture ;

-   Date ;

-   Locataire ;

-   Montant ;

-   Statut paiement.

## Factures impayées

Informations :

-   Locataire ;

-   Bien ;

-   Montant dû ;

-   Date échéance ;

-   Nombre de jours de retard.

## Factures partiellement payées

Informations :

-   Montant initial ;

-   Montant payé ;

-   Solde restant.

## Journal des encaissements

Informations :

-   Date ;

-   Locataire ;

-   Montant ;

-   Mode paiement ;

-   Agent ayant enregistré.

## Relevé des paiements d\'un locataire

Contenu :

-   Historique complet des règlements ;

-   Factures associées ;

-   Soldes.

# 16.7 Rapports cautions

## État des cautions

Catégories :

-   Cautions détenues ;

-   Cautions remboursées ;

-   Cautions avec retenues.

Informations :

-   Locataire ;

-   Contrat ;

-   Montant initial ;

-   Retenue ;

-   Montant remboursé.

# 16.8 Rapports financiers de synthèse

## Tableau des loyers attendus

Présentation :

  -----------------------------------------------------------------------
  **Période**                    **Montant attendu**
  ------------------------------ ----------------------------------------
  Mois courant                   XXXX FCFA

  Trimestre                      XXXX FCFA

  Année                          XXXX FCFA
  -----------------------------------------------------------------------

## Tableau des loyers encaissés

Comparaison :

-   Prévision ;

-   Réalisation ;

-   Écart.

## Balance des impayés

Présentation :

  ------------------------------------------------------------------------
  **Locataire**             **Montant dû**              **Retard**
  ------------------------- --------------------------- ------------------
  Locataire A               XXX FCFA                    XX jours

  ------------------------------------------------------------------------

# 16.9 Graphiques obligatoires

Le tableau de bord devra intégrer :

## Graphique évolution chiffre d\'affaires

Périodes :

-   mensuelle ;

-   trimestrielle ;

-   annuelle.

## Graphique occupation patrimoine

Répartition :

-   Occupés ;

-   Libres ;

-   Travaux.

## Graphique répartition des biens

Par catégorie :

-   Appartement ;

-   Villa ;

-   Maison ;

-   Bureau ;

-   Magasin ;

-   Autres.

## Graphique évolution impayés

Suivi :

-   nombre de clients concernés ;

-   montant total ;

-   évolution mensuelle.

# 17. NOTIFICATIONS ET AUTOMATISATIONS

## 17.1 Objectif

Automatiser les tâches répétitives et améliorer le suivi administratif.

# 17.2 Centre de notifications interne

Chaque utilisateur disposera d\'un espace :

**Notifications**

Types :

-   Information ;

-   Alerte ;

-   Action requise.

# 17.3 Notifications Email

Les utilisateurs autorisés pourront recevoir des emails automatiques.

Destinataires :

-   Administrateur ;

-   Gérant ;

-   Gestionnaire locatif.

# 17.4 Automatisation des factures

Règle :

Chaque mois, le :

## 25 du mois

Le système :

1.  Recherche les contrats actifs ;

2.  Calcule les montants dus ;

3.  Génère les factures ;

4.  Produit les PDF ;

5.  Notifie les utilisateurs.

# 17.5 Alertes échéances

Avant le 10 du mois :

Notification :

\"Une facture arrive à échéance avant le 10 du mois.\"

# 17.6 Alertes impayés

Après échéance :

Le système identifie :

-   factures non payées ;

-   paiements partiels ;

-   retards.

Notification :

-   Gestionnaire ;

-   Gérant.

# 17.7 Renouvellement automatique des contrats

Le système doit :

-   vérifier les contrats arrivant à échéance ;

-   appliquer la tacite reconduction ;

-   conserver l\'historique ;

-   informer le gérant.

# 17.8 Rapport mensuel automatique

Chaque mois :

Envoi automatique au gérant.

Contenu :

## Synthèse immobilière

-   Situation du patrimoine ;

-   Occupation ;

-   Disponibilités.

## Synthèse financière

-   Loyers attendus ;

-   Loyers encaissés ;

-   Impayés ;

-   Chiffre d\'affaires.

## Alertes

-   Contrats ;

-   Cautions ;

-   Biens vacants.

# 18. ARCHITECTURE TECHNIQUE DÉTAILLÉE

# 18.1 Type d\'application

Application :

**Web responsive**

Accessible depuis :

-   PC ;

-   tablette ;

-   smartphone.

# 18.2 Architecture générale

UTILISATEURS

\|

\|

Navigateur Web

\|

\|

Application Frontend

\|

\|

API Backend

\|

\|

Base PostgreSQL

\|

\|

Services externes :

\- Google Drive

\- Email

# 18.3 Technologies recommandées

## Frontend

Technologie recommandée :

**React.js / Next.js**

Objectifs :

-   interface moderne ;

-   rapidité ;

-   compatibilité mobile.

## Backend

Technologie recommandée :

**Node.js**

Objectifs :

-   sécurité ;

-   rapidité développement ;

-   maintenance facilitée.

## Base de données

Technologie :

**PostgreSQL**

Justification :

-   robuste ;

-   fiable ;

-   adaptée aux données financières ;

-   adaptée aux relations complexes.

# 18.4 Hébergement

Mode retenu :

## VPS professionnel

Configuration indicative :

-   Linux Ubuntu Server ;

-   4 Go RAM minimum ;

-   stockage SSD ;

-   certificat HTTPS.

# 18.5 Sécurité

Mesures obligatoires :

-   Connexion HTTPS ;

-   Gestion des droits ;

-   Chiffrement des mots de passe ;

-   Sauvegardes automatiques ;

-   Journal d\'audit.

# 18.6 Stockage documentaire

Principe :

Les documents seront stockés sur :

**Google Drive professionnel ou solution équivalente**

L\'application conserve :

-   lien document ;

-   type ;

-   date ;

-   utilisateur.

# 19. STRUCTURE DE LA BASE DE DONNÉES

## Tables principales

### BIEN

Gestion du patrimoine immobilier.

### LOCATAIRE

Gestion des clients.

### CONTRAT

Gestion des locations.

### FACTURE

Gestion de la facturation.

### PAIEMENT

Gestion des règlements.

### CAUTION

Gestion des dépôts de garantie.

### DOCUMENT

Gestion documentaire.

### UTILISATEUR

Gestion des accès.

### AUDIT

Traçabilité.

# 19.1 Relations principales

BIEN

\|

\|\-\-\-- N CONTRATS

\|

\|

LOCATAIRE

CONTRAT

\|

\|\-\-\-- N FACTURES

\|

\|

N PAIEMENTS

CONTRAT

\|

\|\-\-\-- 1 CAUTION

# 20. LIVRABLES ATTENDUS DU PRESTATAIRE

Le prestataire devra fournir :

# 20.1 Livrables logiciels

✅ Application web complète\
✅ Code source complet\
✅ Base PostgreSQL\
✅ Scripts d\'installation\
✅ Configuration serveur\
✅ Version production opérationnelle

# 20.2 Livrables documentaires

✅ Cahier technique\
✅ Manuel utilisateur\
✅ Manuel administrateur\
✅ Documentation base de données\
✅ Documentation API

# 20.3 Formation

Formation obligatoire :

## Administrateur

-   gestion utilisateurs ;

-   paramétrage ;

-   sauvegardes.

## Gérant

-   validation ;

-   rapports ;

-   contrôle financier.

## Gestionnaire locatif

-   utilisation quotidienne ;

-   contrats ;

-   factures ;

-   paiements.

# 21. CRITÈRES DE RÉCEPTION DU PROJET

L\'application sera considérée comme acceptée lorsque :

## Fonctionnel

-   Tous les modules prévus sont disponibles ;

-   Les règles métier sont respectées.

## Technique

-   Application accessible en ligne ;

-   Sécurité active ;

-   Sauvegardes opérationnelles.

## Documents

-   PDF générés correctement ;

-   Exports Excel fonctionnels.

## Utilisateurs

-   Comptes créés ;

-   Formation réalisée.

# 22. MAINTENANCE ET ÉVOLUTION

Le prestataire devra proposer :

## Maintenance corrective

-   Correction des anomalies.

## Maintenance évolutive

Possibilités futures :

-   Application mobile native ;

-   Paiement en ligne ;

-   Connexion comptabilité ;

-   Portail locataire ;

-   Notifications WhatsApp API.
