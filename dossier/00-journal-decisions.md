# 00. Journal des décisions

> Tenu à jour à chaque étape validée du dossier de conception.
> Dernière section validée : 16 - Évolutions futures. Dossier de conception complet (16/16 sections validées).

| ID | Date | Étape | Question | Décision | Impact |
|---|---|---|---|---|---|
| D-001 | 29/07/2026 | 01 | Forme juridique, capital, effectif de CIMEC ? | SARL, capital 1 000 000 FCFA, effectif 5 personnes | Section 01 |
| D-002 | 29/07/2026 | 01 | Coordonnées officielles ? | Treichville Zone III, Abidjan ; tél. +225 01 03 98 95 50 ; email cimec@gmail.com | Section 01, en-tête des documents (contrats, factures, quittances) |
| D-003 | 29/07/2026 | 01 | Taille du patrimoine ? | 70 biens, toutes catégories confondues, répartis notamment sur Treichville, Zone IV, Zone III | Section 01, dimensionnement (volumétrie section 03) |
| D-004 | 29/07/2026 | 01 | Date de création de la SARL ? | Année 2000 | Section 01 |
| D-005 | 29/07/2026 | 01 | Organisation interne actuelle (5 postes) ? | Administrateur, Gérant, Gestionnaire actif, Comptable, Superviseur | Section 01, base des profils utilisateurs (section 04) |
| D-006 | 29/07/2026 | 01 | Le Comptable et le Superviseur ne figurent pas dans les 4 profils CDC §13 — à quel profil applicatif les rattacher ? | Comptable et Superviseur se voient rattachés au profil **Consultation** (lecture seule), avec accès aux données de loyers | Section 04 — Acteurs (à détailler : périmètre exact de consultation pour ces deux postes) |
| D-007 | 29/07/2026 | 02 | Outils actuels et points de douleur ? | Application Access locale sur PC + registre papier ; limites : accessibilité, ergonomie, sécurité, pilotage | Section 02 |
| D-008 | 29/07/2026 | 02 | Indicateurs de succès attendus ? | Accessibilité étendue, ergonomie et sécurité renforcées, tableaux de bord plus précis, amélioration des encaissements, gestion des rappels, meilleure digitalisation | Section 02, section 13 (états et rapports), section 08 (processus impayés) |
| D-009 | 29/07/2026 | 02 | Échéance souhaitée de mise en production ? | Non déterminée à ce stade | Section 02 |
| D-010 | 29/07/2026 | 03 | Volumétrie estimée ? | 70 biens, 70 locataires actifs, 80-90 factures/mois, 5 utilisateurs simultanés | Section 03, dimensionnement technique |
| D-011 | 29/07/2026 | 03 | Reprise de données existantes ? | Import initial via fichiers Excel au démarrage | Section 03, phase de développement (préparation modèles d'import) |
| D-012 | 29/07/2026 | 03 | Usage hors-ligne nécessaire ? | Non requis en V1 (priorité web) ; souhaité par l'agence → reporté en évolution future | Section 03, section 16 (évolutions futures) |
| D-013 | 29/07/2026 | 04 | Le locataire est-il un acteur direct du système en V1 ? | Non — confirmé, portail locataire reporté en évolution future | Section 04, section 16 |
| D-014 | 29/07/2026 | 04 | Cumul de profils par un même utilisateur ? | Non — un profil unique par compte | Section 04, section 14 (sécurité et profils) |
| D-015 | 29/07/2026 | 05 | Prorata premier mois si entrée en cours de mois ? | Non — mois plein facturé, pas de prorata | Section 05 (RG-F06), moteur de facturation |
| D-016 | 29/07/2026 | 05 | Montant standard de la caution ? | 2 mois de loyer par défaut, modifiable au besoin par contrat | Section 05 (RG-K04), modèle de données (contrat) |
| D-017 | 29/07/2026 | 05 | Délai de remboursement de la caution au départ ? | Pas de délai imposé par le système | Section 05 (RG-K05) |
| D-018 | 29/07/2026 | 05 | Ordre d'imputation d'un paiement sur plusieurs factures dues ? | La plus ancienne facture d'abord | Section 05 (RG-P06), moteur de paiement |
| D-019 | 29/07/2026 | 05 | Pénalités de retard ? | Aucune pénalité en V1 | Section 05 (RG-F07) |
| D-020 | 29/07/2026 | 05 | Échéance de paiement mensuel ? | Confirmé : avant le 10 du mois | Section 05 (RG-F05) |
| D-021 | 29/07/2026 | 05 | Facturation trimestrielle/annuelle : facture globale ou factures mensuelles ? | Facture globale unique pour toute la période (loyers cumulés), payée d'avance | Section 05 (RG-F08), moteur de facturation |
| D-022 | 29/07/2026 | 06 | Découpage en lots pour le développement ? | Non — livraison en un seul bloc, tous les modules ensemble | Section 06, planification du développement |
| D-023 | 29/07/2026 | 07 | Liste des cas d'utilisation majeurs à détailler ? | 9 cas retenus : créer un bien, créer un locataire, créer/valider un contrat, générer les factures du 25, enregistrer un paiement, générer une quittance, réviser un loyer, clôturer un contrat et solder la caution, consulter le tableau de bord | Section 07 |
| D-024 | 29/07/2026 | 08 | Circuit d'entrée locataire ? | Confirmé : visite hors système → dossier locataire → création/validation contrat → caution + avance → remise des clés | Section 08 (P1) |
| D-025 | 29/07/2026 | 08 | Circuit de sortie (préavis, état des lieux) ? | Préavis et état des lieux gérés hors système (non tracés dans l'application) | Section 08 (P6) |
| D-026 | 29/07/2026 | 08 | Niveaux et canaux de relance impayés, décision contentieux ? | Relance amiable puis mise en demeure à l'appréciation du gérant ; canaux : WhatsApp, email, SMS ; action contentieuse décidée par le gérant | Section 08 (P4) |
| D-027 | 29/07/2026 | 08 | WhatsApp comme canal de relance : V1 ou évolution future (CDC le classe en évolution future) ? | Intégré dès la V1 — extension de périmètre par rapport au CDC initial (nécessite une intégration WhatsApp Business API) | Section 03 (contraintes techniques), section 08 (P4), section 16 (WhatsApp retiré de la liste des évolutions futures) |
| D-028 | 29/07/2026 | 09 | Entité PROPRIÉTAIRE distincte ? | Non — l'agence CIMEC est l'unique propriétaire, pas d'entité métier dédiée | Section 09 (MCD) |
| D-029 | 29/07/2026 | 09 | Quartiers/communes en tables de référence ? | Oui — tables `communes` et `quartiers` gérables par l'administrateur | Section 09 (MCD), section 10 (MLD) |
| D-030 | 29/07/2026 | 09 | Quittance : entité distincte ou attribut du paiement ? | Entité distincte (table `quittances`), pour la numérotation légale | Section 09 (MCD) |
| D-031 | 31/07/2026 | 10 | Conventions techniques du MLD ? | snake_case pluriel, PK `id` UUID, `created_at`/`updated_at`, montants `NUMERIC(12,0)`, suppression logique, unicité contrat actif par bien | Section 10 (MLD) |
| D-032 | 31/07/2026 | 12 | Charte graphique de l'agence ? | Couleurs bleu et orange ; logo à ajouter ultérieurement (placeholder en attendant) | Section 12 (interfaces), maquettes |
| D-033 | 31/07/2026 | 12 | Navigation de l'application ? | Menu latéral (desktop/tablette), transformé en menu bas ou burger sur smartphone | Section 12 |
| D-034 | 31/07/2026 | 13 | Mentions légales/fiscales sur factures et quittances (RCCM, NCC, TVA) ? | Pas de RCCM ni NCC ; TVA non appliquée | Section 13, maquettes facture/quittance |
| D-035 | 31/07/2026 | 13 | Modèle de contrat existant à reproduire ? | Aucun — proposer une trame standard conforme au droit ivoirien : bail habitation (locataires personnes physiques) et bail commercial (locataires entreprises) | Section 13 (maquette contrat), Section 05 (RG-C06, deux trames selon type de locataire) |
| D-036 | 31/07/2026 | 14 | Politique de mots de passe ? | 8 caractères minimum, majuscule + chiffre exigés, pas d'expiration forcée | Section 14 |
| D-037 | 31/07/2026 | 14 | Double authentification (2FA) ? | Non en V1 — évolution future possible | Section 14, section 16 |
| D-038 | 31/07/2026 | 14 | Durée de session / déconnexion automatique ? | 30 minutes d'inactivité | Section 14 |
| D-039 | 31/07/2026 | 14 | Fréquence et rétention des sauvegardes ? | Sauvegarde automatique quotidienne, rétention 30 jours | Section 14, architecture technique (VPS) |
| D-040 | 31/07/2026 | 16 | Ordre de priorité et horizon des évolutions futures ? | Horizon moyen terme pour toutes ; ordre proposé : paiement en ligne, portail locataire, usage hors-ligne, connexion comptabilité, application mobile native, 2FA | Section 16 |
| D-041 | 01/08/2026 | 14 | Qui peut exécuter l'import Excel de reprise de données (EF-32) ? | Administrateur seul (opération de démarrage à fort impact, absente de la matrice initiale) | Section 14, phase de développement (Sprint 8) |
| D-042 | 01/08/2026 | 15 | Génération manuelle d'une facture pour un contrat précis (hors cycle automatique du 25, RG-F01) ? | Autorisée, en réutilisant exactement les règles de génération automatique (mois plein RG-F06, échéance le 10 RG-F05, arriérés RG-F02) — pas de saisie libre de montant/période. Ouverte à l'Administrateur et au Gestionnaire locatif (pas au Gérant, ni à Consultation) | Section 14 (matrice), section 15 (EF-13) |
