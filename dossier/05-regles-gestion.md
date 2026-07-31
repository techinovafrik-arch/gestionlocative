# 05. Règles de gestion

Chaque règle cite sa source : référence au cahier des charges (CDC §) ou décision du journal (D-XXX).

## 5.1 Biens

| Réf. | Règle | Source |
|---|---|---|
| RG-B01 | Chaque bien possède un code unique (généré automatiquement ou saisi manuellement) | CDC §5.1 |
| RG-B02 | Types de biens : maison, villa, appartement, studio, chambre, bureau, magasin, entrepôt, terrain, immeuble, local commercial | CDC §1.1 |
| RG-B03 | Statuts d'un bien : Libre, Occupé, En travaux | CDC §5.2 |
| RG-B04 | Champs obligatoires : code, type, description, commune, quartier, adresse, prix de location, charges mensuelles | CDC §5.3 |
| RG-B05 | Un bien passe automatiquement à « Occupé » à la validation d'un contrat | CDC §7.4 |
| RG-B06 | Tous les biens sont non meublés et appartiennent à l'agence (pas de biens de tiers) | CDC §1.1, §3.2 |
| RG-B07 | L'historique des occupations d'un bien est conservé | CDC §2, §16.3 |

## 5.2 Locataires

| Réf. | Règle | Source |
|---|---|---|
| RG-L01 | Deux types : personne physique (civilité, nom, prénoms, date de naissance, nationalité, profession) et entreprise (raison sociale, infos administratives, représentant) | CDC §6.1 |
| RG-L02 | Identification : code locataire, téléphone principal, téléphone secondaire, email, contact d'urgence | CDC §6.2 |
| RG-L03 | Pièces d'identité acceptées : passeport, CNI, carte consulaire, permis de conduire — avec type, numéro, date d'expiration | CDC §6.3 |
| RG-L04 | Au départ d'un locataire : historique conservé ; données personnelles archivées 1 an puis suppression automatique | CDC §6.4 |
| RG-L05 | L'historique locatif (logements, contrats, paiements, incidents) est consultable | CDC §16.4 |

## 5.3 Contrats

| Réf. | Règle | Source |
|---|---|---|
| RG-C01 | Un contrat lie obligatoirement un bien et un locataire | CDC §7.2 |
| RG-C02 | Champs : numéro unique, bien, locataire, date début, date fin, loyer, charges, caution, avance sur loyer (optionnelle), périodicité (mensuelle/trimestrielle/annuelle), statut | CDC §7.2 |
| RG-C03 | Statuts : Actif, Résilié, Terminé | CDC §7.2 |
| RG-C04 | Durée standard : 1 an, renouvelable par tacite reconduction ; le renouvellement est automatique, l'ancien contrat est conservé, l'historique créé, le gérant informé | CDC §7.3, §17.7 |
| RG-C05 | Création par le gestionnaire locatif ; validation finale par le gérant. Après validation : contrat actif, bien « Occupé », facturation possible | CDC §7.4 |
| RG-C06 | Génération automatique du contrat PDF (logo, coordonnées agence, bailleur, locataire, bien, conditions financières, durée, clauses, zones de signature). Deux trames selon le type de locataire : bail habitation (personne physique) ou bail commercial (entreprise) | CDC §7.5, D-035 |
| RG-C07 | Révision de loyer possible en cours de contrat, avec historique obligatoire : ancien montant, nouveau montant, date, motif, utilisateur, validation du gérant | CDC §7.6 |

## 5.4 Facturation

| Réf. | Règle | Source |
|---|---|---|
| RG-F01 | Facturation mensuelle, générée automatiquement le 25 de chaque mois pour les contrats actifs, au titre du mois suivant | CDC §8.1 |
| RG-F02 | Contenu obligatoire : numéro unique, date d'émission, période, locataire, bien, loyer, charges, arriérés, total à payer, montant payé, solde restant | CDC §8.3 |
| RG-F03 | Périodicités gérées : mensuelle, trimestrielle, annuelle — option par locataire/contrat | CDC §8.4 |
| RG-F04 | La facture PDF est consultable, téléchargeable et envoyable par email | CDC §8.5 |
| RG-F05 | Échéance de paiement : avant le 10 du mois | CDC §17.5, D-020 |
| RG-F06 | Pas de prorata pour le premier mois de location : le mois d'entrée est facturé en mois plein, quelle que soit la date d'entrée | D-015 |
| RG-F07 | Aucune pénalité de retard en V1 | D-019 |
| RG-F08 | Pour les contrats en périodicité trimestrielle ou annuelle : une **facture globale unique** est émise pour toute la période (loyers cumulés), payée d'avance — pas de factures mensuelles séparées | D-021 |

## 5.5 Paiements

| Réf. | Règle | Source |
|---|---|---|
| RG-P01 | Une facture peut être réglée en totalité, partiellement ou en plusieurs versements ; le système calcule montant payé, reste à payer, état de la facture | CDC §9.2 |
| RG-P02 | Moyens acceptés : espèces, virement bancaire, chèque, Orange Money, MTN Money, Moov Money, Wave | CDC §9.3 |
| RG-P03 | Chaque transaction conserve : référence, date, montant, mode, utilisateur encaisseur, facture associée | CDC §9.4, §9.5 |
| RG-P04 | La correction d'un paiement nécessite la validation du gérant | CDC §14 |
| RG-P05 | Après validation d'un paiement : génération automatique d'une quittance PDF (logo, numéro, date, locataire, bien, période, montant, mode) | CDC §10 |
| RG-P06 | Quand un locataire a plusieurs factures dues, un paiement s'impute d'abord sur la facture la plus ancienne | D-018 |

## 5.6 Cautions

| Réf. | Règle | Source |
|---|---|---|
| RG-K01 | Caution exigée à la signature ; enregistrée avec montant initial, date de versement, contrat associé | CDC §11.1, §11.2 |
| RG-K02 | À la sortie : remboursement intégral OU avec retenue (motifs : dommages, réparations, sommes dues) | CDC §11.3 |
| RG-K03 | Décision et validation par le gérant ; conservation de : montant retenu, motif, montant remboursé, date, validateur | CDC §11.4 |
| RG-K04 | Montant standard de la caution : **2 mois de loyer par défaut**, proposé automatiquement à la création du contrat mais modifiable au cas par cas | D-016 |
| RG-K05 | Aucun délai de remboursement de la caution n'est imposé par le système | D-017 |

## 5.7 Documents

| Réf. | Règle | Source |
|---|---|---|
| RG-D01 | Stockage externe (Google Drive pro ou équivalent) ; l'application conserve uniquement référence, type, lien sécurisé, association métier, date, utilisateur | CDC §12.1, §18.6 |
| RG-D02 | Documents rattachés : biens (administratifs), locataires (pièces d'identité, justificatifs), contrats (PDF, avenants), finance (factures, quittances, justificatifs) | CDC §12.2 |

## 5.8 Utilisateurs, validations, audit

| Réf. | Règle | Source |
|---|---|---|
| RG-U01 | Quatre profils : Administrateur, Gérant, Gestionnaire locatif, Consultation (lecture seule) ; un profil unique par compte | CDC §13.1, D-014 |
| RG-U02 | Opérations soumises à validation du gérant : activation contrat, révision loyer, retenue caution, remboursement caution, correction paiement | CDC §14 |
| RG-U03 | Journal d'audit sur toutes les opérations sensibles : utilisateur, date, heure, action, ancienne valeur, nouvelle valeur | CDC §15 |

## 5.9 Notifications et automatisations

| Réf. | Règle | Source |
|---|---|---|
| RG-N01 | Centre de notifications interne par utilisateur ; types : Information, Alerte, Action requise | CDC §17.2 |
| RG-N02 | Emails automatiques aux profils Administrateur, Gérant, Gestionnaire | CDC §17.3 |
| RG-N03 | Le 25 du mois : recherche des contrats actifs → calcul des montants → génération des factures → PDF → notification | CDC §17.4 |
| RG-N04 | Alerte échéance avant le 10 du mois ; alertes impayés après échéance (gestionnaire + gérant) | CDC §17.5, §17.6 |
| RG-N05 | Rapport mensuel automatique envoyé au gérant (synthèses immobilière, financière, alertes) | CDC §17.8 |

## 5.10 Divers

| Réf. | Règle | Source |
|---|---|---|
| RG-X01 | Devise : FCFA, sans décimales dans les montants courants | CDC §16.8, CLAUDE.md |
| RG-X02 | Rapports exportables PDF et Excel, imprimables | CDC §16.1 |
| RG-X03 | Code source, base de données et documentation : propriété de l'agence | CDC §4.2 |
