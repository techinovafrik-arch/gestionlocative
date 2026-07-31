# 03. Analyse des besoins

## 3.1 Besoins fonctionnels par module

Le système devra intégrer les 12 modules suivants (CDC §3.1) :

| Module | Besoin |
|---|---|
| Gestion des biens | Enregistrer, identifier (code unique), localiser, suivre la disponibilité et l'historique d'occupation des 70 biens du patrimoine |
| Gestion des locataires | Créer une fiche complète (personne physique ou entreprise), suivre l'historique locatif, archiver les anciens locataires |
| Gestion des contrats | Créer, générer en PDF, suivre les renouvellements, historiser les révisions de loyer |
| Gestion des factures | Générer automatiquement les factures mensuelles (~80 à 90 factures/mois) |
| Gestion des paiements | Enregistrer les paiements totaux et partiels, suivre les impayés |
| Gestion des cautions | Suivre les dépôts de garantie sur toute la durée du contrat, jusqu'au solde de départ |
| Gestion documentaire | Référencer les documents (contrats, pièces d'identité, etc.) stockés sur Google Drive |
| Notifications | Alertes échéances, impayés, contrats, cautions |
| Rapports | Rapports financiers et d'activité, filtrables |
| Tableaux de bord | Vue de pilotage pour le gérant et l'administrateur |
| Gestion des utilisateurs | Comptes, profils, droits d'accès |
| Journal d'audit | Traçabilité des actions sensibles |

## 3.2 Besoins non fonctionnels

### Volumétrie estimée
- **70 biens** au patrimoine ;
- **70 locataires actifs** ;
- **80 à 90 factures émises par mois** ;
- **5 utilisateurs connectés simultanément** (à dimensionner avec une marge raisonnable).

### Performance
Le système doit rester réactif avec la volumétrie ci-dessus et une charge de 5 utilisateurs simultanés, sans dégradation perceptible du temps de réponse sur les opérations courantes (consultation, saisie, génération de facture/quittance).

### Sécurité
HTTPS obligatoire, droits d'accès par profil, mots de passe chiffrés (hash), sauvegardes automatiques, journal d'audit (cf. section 14 — Sécurité et profils, CDC §18).

### Disponibilité
Hébergement sur VPS Linux Ubuntu (4 Go RAM minimum, SSD) avec sauvegardes automatiques régulières, permettant une continuité de service adaptée à un usage professionnel quotidien.

### Ergonomie et mobilité
Application web responsive, utilisable sans réserve sur ordinateur, tablette et smartphone (CDC §4.1, §18.1), avec une ergonomie améliorée par rapport à l'outil Access actuel (cf. section 02).

### Reprise de données
Import initial des données existantes (biens, locataires, contrats en cours) **via fichiers Excel**, au démarrage de l'application. Ce besoin implique la préparation de modèles de fichiers d'import et d'un contrôle de cohérence à la reprise (à détailler en phase de développement).

### Connectivité
Application accessible **en ligne (web)** — c'est le mode d'usage prioritaire pour la V1. Un usage hors-ligne est souhaité par l'agence mais n'est pas requis pour la V1 ; il est reporté en piste d'évolution future (cf. section 16 — Évolutions futures).

## 3.3 Exclusions V1

Conformément au CDC §3.2, ne sont pas prévus dans la première version :
- Gestion des visites immobilières ;
- Gestion des photos des biens ;
- Signature électronique ;
- Gestion multi-agences ;
- Gestion de biens appartenant à des tiers.

À ces exclusions s'ajoute, suite à l'analyse des besoins :
- **Usage hors-ligne** (reporté en évolution future, cf. section 16).

## 3.4 Contraintes

- Développement sur mesure, code source, base de données et documentation propriété de l'agence (CDC §4.2) ;
- Base de données PostgreSQL, hébergement VPS Linux Ubuntu, HTTPS obligatoire (CLAUDE.md) ;
- Devise FCFA (XOF), sans décimales dans les montants courants ;
- Langue unique : français ;
- Documents stockés sur Google Drive professionnel — l'application ne conserve que la référence, le type et le lien sécurisé ;
- **Intégration WhatsApp Business API** pour les relances impayés — extension de périmètre par rapport au CDC initial, qui classait WhatsApp en évolution future (D-027 ; cf. section 08, section 16).
