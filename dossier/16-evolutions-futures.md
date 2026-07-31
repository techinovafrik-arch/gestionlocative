# 16. Évolutions futures

Toutes les évolutions ci-dessous sont positionnées à **horizon moyen terme** (D-040), après stabilisation de la V1. L'ordre reflète la priorité proposée, alignée sur les objectifs de l'agence (section 02 : amélioration des encaissements, accessibilité étendue, digitalisation).

*(Rappel : les notifications WhatsApp, initialement classées en évolution future par le CDC §22, ont été intégrées dès la V1 — D-027.)*

## 16.1 Paiement en ligne

| | |
|---|---|
| Priorité | 1 |
| Horizon | Moyen terme |
| Description | Permettre au locataire de régler sa facture directement en ligne (carte bancaire, Mobile Money) sans passer par un encaissement manuel |
| Valeur | Répond directement à l'objectif « amélioration des encaissements » (D-008) ; réduit les délais de paiement |
| Prérequis | Portail locataire (ou a minima un lien de paiement sécurisé par facture), contrat avec un agrégateur de paiement (Mobile Money / carte) |
| Impacts à anticiper en V1 | Le champ `paiements.mode` (section 11.16) est déjà extensible ; prévoir dans le modèle un identifiant de transaction externe (référence agrégateur) sur `paiements` |

## 16.2 Portail locataire

| | |
|---|---|
| Priorité | 2 |
| Horizon | Moyen terme |
| Description | Espace en ligne permettant au locataire de consulter ses factures, quittances et son historique, et de recevoir ses notifications |
| Valeur | Renforce l'« accessibilité étendue » visée (D-008) ; réduit les sollicitations directes du gestionnaire |
| Prérequis | Le locataire devient un acteur authentifié du système (actuellement exclu en V1 — D-013) ; nécessite un compte et des droits dédiés |
| Impacts à anticiper en V1 | Prévoir que `locataires.email` reste fiable et unique par locataire actif, en vue d'un futur compte d'accès |

## 16.3 Usage hors-ligne

| | |
|---|---|
| Priorité | 3 |
| Horizon | Moyen terme |
| Description | Permettre une utilisation partielle de l'application sans connexion internet (consultation, saisie différée synchronisée ensuite) |
| Valeur | Répond au souhait exprimé par l'agence (D-012), en complément du mode web prioritaire en V1 |
| Prérequis | Application web progressive (PWA) ou application dédiée avec synchronisation |
| Impacts à anticiper en V1 | Architecture API découplée du frontend (déjà prévue, CDC §18.2), facilitant une synchronisation ultérieure |

## 16.4 Connexion comptabilité

| | |
|---|---|
| Priorité | 4 |
| Horizon | Moyen terme |
| Description | Interfaçage avec un logiciel ou cabinet comptable (export automatisé des écritures financières) |
| Valeur | Facilite le travail du Comptable (profil Consultation, D-006), déjà rattaché aux données de loyers |
| Prérequis | Choix d'un format d'export standard (ex. FEC, CSV comptable) avec l'expert-comptable de l'agence |
| Impacts à anticiper en V1 | Les rapports financiers (section 13) et le dictionnaire de données (section 11) couvrent déjà les montants nécessaires à un export |

## 16.5 Application mobile native

| | |
|---|---|
| Priorité | 5 |
| Horizon | Moyen terme |
| Description | Application mobile dédiée (iOS/Android), en complément du web responsive déjà prévu en V1 |
| Valeur | Confort d'usage supplémentaire ; le web responsive (CDC §4.1) couvre déjà l'essentiel du besoin mobile |
| Prérequis | API backend déjà exposée (réutilisable par une app native) |
| Impacts à anticiper en V1 | Aucun impact spécifique sur le modèle de données ; veiller à ce que l'API reste indépendante du frontend web |

## 16.6 Double authentification (2FA)

| | |
|---|---|
| Priorité | 6 |
| Horizon | Moyen terme |
| Description | Ajout d'un second facteur d'authentification (code SMS/email/application) à la connexion |
| Valeur | Renforce la sécurité des comptes, notamment Administrateur et Gérant |
| Prérequis | Choix d'un canal de second facteur (SMS, email, TOTP) |
| Impacts à anticiper en V1 | Prévoir sur `utilisateurs` la possibilité d'ajouter un champ de secret 2FA sans migration lourde (le modèle actuel le permet nativement) |
