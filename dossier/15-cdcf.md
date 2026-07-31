# 15. Cahier des charges fonctionnel

Consolidation des exigences fonctionnelles (EF-XX) et non fonctionnelles (ENF-XX), avec priorité **Must** (indispensable), **Should** (important) ou **Could** (confort), et critères d'acceptation alignés sur les critères de réception du CDC (§21). Livraison en un seul bloc (D-022) : toutes les exigences Must et Should sont attendues au go-live.

## 15.1 Exigences fonctionnelles

### Gestion des biens

| Réf. | Exigence | Priorité | Critère d'acceptation |
|---|---|---|---|
| EF-01 | Créer, modifier, consulter un bien avec code unique et statut (Libre/Occupé/En travaux) | Must | Un bien créé apparaît dans la liste avec un code unique et un statut correct (RG-B01 à RG-B04) |
| EF-02 | Passage automatique du bien à « Occupé » à l'activation d'un contrat, et à « Libre » à la clôture | Must | Le statut du bien change sans intervention manuelle (RG-B05) |
| EF-03 | Consulter l'historique d'occupation d'un bien | Should | L'historique liste tous les locataires successifs avec dates (RG-B07) |

### Gestion des locataires

| Réf. | Exigence | Priorité | Critère d'acceptation |
|---|---|---|---|
| EF-04 | Créer une fiche locataire (personne physique ou entreprise) avec pièce d'identité | Must | Fiche complète enregistrée avec code unique (RG-L01 à RG-L03) |
| EF-05 | Archiver un locataire sorti avec purge automatique après 1 an | Must | Les données personnelles disparaissent automatiquement après le délai (RG-L04) |
| EF-06 | Consulter l'historique locatif d'un locataire | Should | Logements, contrats, paiements et incidents affichés (RG-L05) |

### Gestion des contrats

| Réf. | Exigence | Priorité | Critère d'acceptation |
|---|---|---|---|
| EF-07 | Créer un contrat lié à un bien libre et un locataire | Must | Impossible de créer un contrat sur un bien déjà occupé (RG-C01, RG-C05) |
| EF-08 | Valider/activer un contrat (Gérant) | Must | Le contrat passe « Actif », le bien « Occupé », la facturation devient possible (RG-C05, RG-U02) |
| EF-09 | Générer le contrat en PDF (trame habitation ou commerciale selon le locataire) | Must | PDF conforme généré automatiquement à la validation (RG-C06, D-035) |
| EF-10 | Réviser un loyer avec historique et validation du Gérant | Must | Ancien/nouveau montant, motif, date et validateur conservés (RG-C07) |
| EF-11 | Renouvellement automatique par tacite reconduction | Should | Contrat reconduit, ancien conservé, Gérant informé (RG-C04) |
| EF-12 | Clôturer un contrat et solder la caution | Must | Contrat « Terminé »/« Résilié », bien « Libre », caution soldée (UC-08) |

### Facturation

| Réf. | Exigence | Priorité | Critère d'acceptation |
|---|---|---|---|
| EF-13 | Génération automatique des factures le 25 de chaque mois pour les contrats actifs | Must | Toutes les factures du mois suivant sont générées le 25 sans intervention (RG-F01, RG-N03) |
| EF-14 | Facturation en mois plein, sans prorata, pour le premier mois | Must | Une entrée en cours de mois est facturée mois plein (RG-F06) |
| EF-15 | Facture globale unique pour les contrats trimestriels/annuels | Must | Une seule facture couvre toute la période, payée d'avance (RG-F08) |
| EF-16 | Consulter, télécharger, envoyer une facture par email | Should | Facture PDF accessible et envoyable depuis l'application (RG-F04) |

### Paiements et quittances

| Réf. | Exigence | Priorité | Critère d'acceptation |
|---|---|---|---|
| EF-17 | Enregistrer un paiement total ou partiel, tous moyens confondus | Must | Le solde de la facture se met à jour correctement (RG-P01, RG-P02) |
| EF-18 | Imputation automatique sur la facture la plus ancienne due | Must | En présence de plusieurs factures dues, la plus ancienne est soldée en premier (RG-P06) |
| EF-19 | Corriger un paiement avec validation du Gérant | Must | Aucune correction n'est appliquée sans validation (RG-P04, RG-U02) |
| EF-20 | Générer automatiquement la quittance PDF après paiement validé | Must | Quittance numérotée produite immédiatement après enregistrement (RG-P05) |

### Cautions

| Réf. | Exigence | Priorité | Critère d'acceptation |
|---|---|---|---|
| EF-21 | Enregistrer et suivre une caution (2 mois de loyer par défaut, modifiable) | Must | Caution créée à la signature, montant modifiable (RG-K01, RG-K04) |
| EF-22 | Solder une caution à la sortie (remboursement intégral ou retenue motivée), validation Gérant | Must | Décision et motif tracés, aucun délai système imposé (RG-K02, RG-K03, RG-K05) |

### Gestion documentaire

| Réf. | Exigence | Priorité | Critère d'acceptation |
|---|---|---|---|
| EF-23 | Rattacher une référence de document (lien Google Drive) à un bien, locataire, contrat ou facture | Should | Le lien est accessible depuis la fiche concernée (RG-D01, RG-D02) |

### Notifications

| Réf. | Exigence | Priorité | Critère d'acceptation |
|---|---|---|---|
| EF-24 | Centre de notifications interne (Information, Alerte, Action requise) | Should | Notifications visibles et marquables comme lues (RG-N01) |
| EF-25 | Alertes échéance (avant le 10) et impayés, envoyées par email, SMS et WhatsApp | Must | Les relances partent automatiquement sur les 3 canaux (RG-N04, D-026, D-027) |
| EF-26 | Rapport mensuel automatique envoyé au Gérant | Should | Synthèse reçue automatiquement chaque mois (RG-N05) |

### Rapports et tableaux de bord

| Réf. | Exigence | Priorité | Critère d'acceptation |
|---|---|---|---|
| EF-27 | Tableau de bord avec indicateurs immobiliers, financiers, locatifs | Must | Les indicateurs du CDC §16.2 s'affichent correctement par profil |
| EF-28 | Graphiques obligatoires (CA, occupation, répartition biens, impayés) | Should | Les 4 graphiques du CDC §16.9 sont disponibles |
| EF-29 | Rapports immobiliers, locataires, contrats, financiers, cautions, filtrables et exportables PDF/Excel | Must | Chaque rapport listé en section 13 est généré, filtrable et exportable (RG-X02) |

### Utilisateurs et sécurité applicative

| Réf. | Exigence | Priorité | Critère d'acceptation |
|---|---|---|---|
| EF-30 | Gérer les comptes utilisateurs avec profil unique par compte | Must | Un compte ne peut porter qu'un seul profil (RG-U01, D-014) |
| EF-31 | Journal d'audit sur toutes les opérations sensibles | Must | Chaque validation/modification sensible est tracée (RG-U03) |

### Reprise de données

| Réf. | Exigence | Priorité | Critère d'acceptation |
|---|---|---|---|
| EF-32 | Import initial des données existantes via fichiers Excel | Must | Les biens, locataires et contrats en cours sont importés sans perte au démarrage (D-011) |

## 15.2 Exigences non fonctionnelles

| Réf. | Exigence | Priorité | Critère d'acceptation |
|---|---|---|---|
| ENF-01 | Application web responsive (PC, tablette, smartphone) | Must | Toutes les fonctions sont utilisables sur les 3 supports (CDC §4.1) |
| ENF-02 | HTTPS obligatoire sur toute l'application | Must | Aucun accès HTTP non chiffré possible (CDC §18) |
| ENF-03 | Mots de passe hachés, politique 8 caractères min. + majuscule + chiffre | Must | Aucun mot de passe stocké en clair ; règle de complexité appliquée à la création (D-036) |
| ENF-04 | Déconnexion automatique après 30 minutes d'inactivité | Should | Session expirée testée et vérifiée (D-038) |
| ENF-05 | Sauvegardes automatiques quotidiennes, rétention 30 jours | Must | Sauvegarde vérifiable chaque jour, restauration testée (D-039) |
| ENF-06 | Hébergement VPS Linux Ubuntu, 4 Go RAM min., SSD | Must | Infrastructure conforme au démarrage (CDC §18) |
| ENF-07 | Performance stable avec 70 biens, 70 locataires, 80-90 factures/mois, 5 utilisateurs simultanés | Must | Pas de dégradation perceptible en usage normal (section 03) |
| ENF-08 | Devise FCFA sans décimales dans toute l'application | Must | Aucun montant affiché avec décimales (RG-X01) |
| ENF-09 | Documents non stockés en base — uniquement référence et lien Google Drive sécurisé | Must | Aucun fichier binaire dans la base de données (RG-D01) |

## 15.3 Synthèse de priorisation

| Priorité | Nombre d'exigences | Portée |
|---|---|---|
| Must | 27 | Cœur métier, sécurité, conformité CDC — conditionnent la recette |
| Should | 10 | Confort d'usage et reporting avancé — attendues au go-live (livraison en bloc) mais tolèrent un ajustement post-lancement si nécessaire |
| Could | 0 | Aucune exigence de confort pure identifiée à ce stade |

## 15.4 Rappel des critères de réception (CDC §21)

- **Fonctionnel** : tous les modules prévus disponibles, règles métier respectées.
- **Technique** : application accessible en ligne, sécurité active, sauvegardes opérationnelles.
- **Documents** : PDF générés correctement, exports Excel fonctionnels.
- **Utilisateurs** : comptes créés, formation réalisée.
