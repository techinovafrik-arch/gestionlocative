---
name: regles-metier
description: Règles de gestion de l'application de gestion locative CISSE MEDOUNE, extraites et codifiées depuis le cahier des charges. Consulter ce skill pour toute question métier (facturation, contrats, paiements, cautions, archivage, validations) lors de la rédaction du dossier de conception, du modèle de données ou du code. Source de vérité métier du projet.
---

# Règles de gestion — Source : cahier des charges v1.0

Chaque règle cite sa source. Les règles marquées **[À TRANCHER]** sont des zones grises à faire valider (voir étape 5 du skill `conception-dossier`).

## Biens (CDC §5)

- **RG-B01** — Chaque bien possède un code unique (généré automatiquement ou saisi manuellement). §5.1
- **RG-B02** — Types de biens : maison, villa, appartement, studio, chambre, bureau, magasin, entrepôt, terrain, immeuble, local commercial. §1.1
- **RG-B03** — Statuts d'un bien : Libre, Occupé, En travaux. §5.2
- **RG-B04** — Champs obligatoires : code, type, description, commune, quartier, adresse, prix de location, charges mensuelles. §5.3
- **RG-B05** — Un bien passe automatiquement à « Occupé » à la validation d'un contrat. §7.4
- **RG-B06** — Tous les biens sont non meublés et appartiennent à l'agence (pas de tiers). §1.1, §3.2
- **RG-B07** — L'historique des occupations d'un bien est conservé. §2, §16.3

## Locataires (CDC §6)

- **RG-L01** — Deux types : personne physique (civilité, nom, prénoms, date de naissance, nationalité, profession) et entreprise (raison sociale, infos administratives, représentant). §6.1
- **RG-L02** — Identification : code locataire, téléphone principal, téléphone secondaire, email, contact d'urgence. §6.2
- **RG-L03** — Pièces d'identité acceptées : passeport, CNI, carte consulaire, permis de conduire — avec type, numéro, date d'expiration. §6.3
- **RG-L04** — Au départ d'un locataire : historique conservé ; données personnelles archivées 1 an puis **suppression automatique**. §6.4
- **RG-L05** — L'historique locatif (logements, contrats, paiements, incidents) est consultable. §16.4

## Contrats (CDC §7)

- **RG-C01** — Un contrat lie obligatoirement un bien et un locataire. §7.2
- **RG-C02** — Champs : numéro unique, bien, locataire, date début, date fin, loyer, charges, caution, avance sur loyer (optionnelle), périodicité (mensuelle/trimestrielle/annuelle), statut. §7.2
- **RG-C03** — Statuts : Actif, Résilié, Terminé. §7.2
- **RG-C04** — Durée standard : 1 an, renouvelable par tacite reconduction ; le renouvellement est automatique, l'ancien contrat est conservé, l'historique créé, le gérant informé. §7.3, §17.7
- **RG-C05** — Création par le gestionnaire locatif ; **validation finale par le gérant**. Après validation : contrat actif, bien « Occupé », facturation possible. §7.4
- **RG-C06** — Génération automatique du contrat PDF (logo, coordonnées agence, bailleur, locataire, bien, conditions financières, durée, clauses, zones de signature). §7.5
- **RG-C07** — Révision de loyer possible en cours de contrat, avec historique obligatoire : ancien montant, nouveau montant, date, motif, utilisateur, **validation du gérant**. §7.6

## Facturation (CDC §8)

- **RG-F01** — Facturation mensuelle, générée automatiquement **le 25 de chaque mois** pour les contrats actifs, au titre du mois suivant. §8.1
- **RG-F02** — Contenu obligatoire : numéro unique, date d'émission, période, locataire, bien, loyer, charges, arriérés, total à payer, montant payé, solde restant. §8.3
- **RG-F03** — Périodicités gérées : mensuelle, trimestrielle, annuelle — option par locataire/contrat. §8.4
- **RG-F04** — La facture PDF est consultable, téléchargeable et envoyable par email. §8.5
- **RG-F05** — Échéance de paiement : avant le **10 du mois** (déduit des alertes §17.5). **[À TRANCHER : confirmer]**
- **[À TRANCHER]** Prorata du premier mois, pénalités de retard (non prévues au CDC), facturation trimestrielle/annuelle (facture unique vs mensuelle anticipée).

## Paiements (CDC §9)

- **RG-P01** — Une facture peut être réglée en totalité, partiellement ou en plusieurs versements ; le système calcule montant payé, reste à payer, état de la facture. §9.2
- **RG-P02** — Moyens acceptés : espèces, virement bancaire, chèque, Orange Money, MTN Money, Moov Money, Wave. §9.3
- **RG-P03** — Chaque transaction conserve : référence, date, montant, mode, utilisateur encaisseur, facture associée. §9.4, §9.5
- **RG-P04** — La **correction d'un paiement** nécessite la validation du gérant. §14
- **RG-P05** — Après validation d'un paiement : génération automatique d'une **quittance PDF** (logo, numéro, date, locataire, bien, période, montant, mode). §10
- **[À TRANCHER]** Ordre d'imputation quand plusieurs factures sont dues (proposer : la plus ancienne d'abord).

## Cautions (CDC §11)

- **RG-K01** — Caution exigée à la signature ; enregistrée avec montant initial, date de versement, contrat associé. §11.1, §11.2
- **RG-K02** — À la sortie : remboursement intégral OU avec retenue (motifs : dommages, réparations, sommes dues). §11.3
- **RG-K03** — Décision et validation par le **gérant** ; conservation de : montant retenu, motif, montant remboursé, date, validateur. §11.4
- **[À TRANCHER]** Montant standard de la caution (n mois de loyer ?) et délai de remboursement.

## Documents (CDC §12)

- **RG-D01** — Stockage externe (Google Drive pro ou équivalent) ; l'application conserve uniquement référence, type, lien sécurisé, association métier, date, utilisateur. §12.1, §18.6
- **RG-D02** — Documents rattachés : biens (administratifs), locataires (pièces d'identité, justificatifs), contrats (PDF, avenants), finance (factures, quittances, justificatifs). §12.2

## Utilisateurs, validations, audit (CDC §13–15)

- **RG-U01** — Quatre profils : Administrateur, Gérant, Gestionnaire locatif, Consultation (lecture seule). §13.1
- **RG-U02** — Opérations soumises à validation du gérant : activation contrat, révision loyer, retenue caution, remboursement caution, correction paiement. §14
- **RG-U03** — Journal d'audit sur toutes les opérations sensibles : utilisateur, date, heure, action, ancienne valeur, nouvelle valeur. §15

## Notifications et automatisations (CDC §17)

- **RG-N01** — Centre de notifications interne par utilisateur ; types : Information, Alerte, Action requise. §17.2
- **RG-N02** — Emails automatiques aux profils Administrateur, Gérant, Gestionnaire. §17.3
- **RG-N03** — Le 25 du mois : recherche des contrats actifs → calcul des montants → génération des factures → PDF → notification. §17.4
- **RG-N04** — Alerte échéance avant le 10 du mois ; alertes impayés après échéance (gestionnaire + gérant). §17.5, §17.6
- **RG-N05** — Rapport mensuel automatique envoyé au gérant (synthèses immobilière, financière, alertes). §17.8

## Divers

- **RG-X01** — Devise : FCFA. §16.8
- **RG-X02** — Rapports exportables PDF et Excel, imprimables. §16.1
- **RG-X03** — Code source, base de données et documentation : propriété de l'agence. §4.2
