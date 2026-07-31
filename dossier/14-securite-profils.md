# 14. Sécurité et profils

## 14.1 Matrice détaillée des permissions par profil

Légende : **C** Création, **L** Lecture, **M** Modification, **S** Suppression/archivage, **V** Validation, **—** aucun accès.

| Fonction | Administrateur | Gérant | Gestionnaire locatif | Consultation |
|---|---|---|---|---|
| Biens — créer/modifier | C M | — | C M | — |
| Biens — consulter | L | L | L | L |
| Biens — changer statut | M | — | M | — |
| Locataires — créer/modifier | C M | — | C M | — |
| Locataires — consulter | L | L | L | L |
| Locataires — archiver | S | — | S | — |
| Contrats — créer | — | — | C | — |
| Contrats — valider/activer | — | **V** | — | — |
| Contrats — consulter | L | L | L | L |
| Révision de loyer — proposer | — | C | C | — |
| Révision de loyer — valider | — | **V** | — | — |
| Factures — consulter/télécharger/envoyer | L | L | L | L |
| Paiements — enregistrer | — | — | C | — |
| Paiements — corriger | — | **V** | — | — |
| Paiements — consulter | L | L | L | L |
| Cautions — suivre | L | L | M | L |
| Cautions — retenue/remboursement | — | **V** | — | — |
| Documents — rattacher | C | — | C | — |
| Documents — consulter | L | L | L | L |
| Notifications — paramétrer | M | — | — | — |
| Notifications — recevoir | L | L | L | L |
| Rapports — générer/exporter | C L | C L | L | L |
| Tableau de bord — consulter | L | L | L | L |
| Utilisateurs — gérer | C M S | — | — | — |
| Journal d'audit — consulter | L | L | — | — |

## 14.2 Workflow des validations sensibles

Conformément au CDC §14, les opérations suivantes ne prennent effet qu'après validation du **Gérant** :

| Opération | Initiateur | Validateur | Effet après validation |
|---|---|---|---|
| Activation contrat | Gestionnaire locatif | Gérant | Contrat « Actif », bien « Occupé », facturation possible |
| Révision loyer | Gestionnaire locatif ou Gérant | Gérant | Nouveau loyer appliqué aux prochaines factures, historique créé |
| Retenue caution | Gestionnaire locatif (constat) | Gérant | Caution soldée avec retenue motivée |
| Remboursement caution | Gestionnaire locatif (constat) | Gérant | Caution remboursée intégralement |
| Correction paiement | Gestionnaire locatif | Gérant | Paiement corrigé, historique conservé |

Tant que la validation n'est pas effectuée, l'opération reste en statut intermédiaire (ex. « en attente de validation ») et n'a aucun effet sur les autres modules (bien, facturation, etc.).

## 14.3 Journal d'audit

Toutes les opérations sensibles listées ci-dessus, ainsi que les créations/modifications/suppressions de biens, locataires, contrats, utilisateurs, sont tracées dans le journal d'audit (RG-U03, CDC §15).

**Informations enregistrées** : utilisateur, date, heure, action, entité concernée, ancienne valeur, nouvelle valeur (format JSON).

**Exemples d'actions tracées** : modification de loyer, suppression/archivage, validation, remboursement, correction de paiement, création/désactivation d'un compte utilisateur.

Le journal est consultable par l'Administrateur et le Gérant (filtrable par utilisateur, date, entité) — cf. section 12 (écran Journal d'audit).

## 14.4 Sécurité technique

| Élément | Règle |
|---|---|
| Transport | HTTPS obligatoire sur l'ensemble de l'application (CDC §18) |
| Mots de passe | Hachés (jamais stockés en clair) ; politique : 8 caractères minimum, au moins une majuscule et un chiffre, pas d'expiration forcée (D-036) |
| Authentification renforcée | Pas de double authentification (2FA) en V1 ; piste d'évolution future (D-037, section 16) |
| Session | Déconnexion automatique après 30 minutes d'inactivité (D-038) |
| Droits d'accès | Contrôle par profil unique par compte (D-014), appliqué à chaque appel API (cf. matrice 14.1) |
| Sauvegardes | Sauvegarde automatique quotidienne, rétention 30 jours (D-039), sur le VPS Linux Ubuntu (CLAUDE.md) |
| Hébergement | VPS Linux Ubuntu, 4 Go RAM minimum, SSD (CLAUDE.md) |
| Données personnelles | Archivage des données du locataire pendant 1 an après son départ, puis suppression automatique (RG-L04, CDC §6.4) |
| Documents | Stockage externe sur Google Drive professionnel ; l'application ne conserve que référence, type, lien sécurisé (RG-D01) |
