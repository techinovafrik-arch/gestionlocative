---
titre: Guide utilisateur — Application de gestion locative CIMEC
soustitre: Agence CISSE MEDOUNE — Abidjan
---

# Guide utilisateur — Application de gestion locative CIMEC

> Support de formation (Sprint 9 — critère de réception CDC §21 : « comptes
> créés, formation réalisée »). Un exemplaire par profil suffit : chaque
> partie ci-dessous ne couvre que ce que ce profil peut faire.

## 1. Connexion

1. Ouvrir l'application dans un navigateur (ordinateur, tablette ou
   smartphone — l'affichage s'adapte automatiquement).
2. Renseigner l'email professionnel et le mot de passe fournis par
   l'Administrateur.
3. En cas d'inactivité prolongée (30 minutes sans action), la session
   expire automatiquement : il suffit de se reconnecter.
4. Le menu de gauche (ou le menu du bas sur smartphone) affiche uniquement
   les rubriques accessibles au profil connecté.

**Mot de passe oublié ou compte bloqué** : contacter l'Administrateur, qui
peut créer un nouveau compte ou réinitialiser l'accès depuis la rubrique
*Utilisateurs*.

## 2. Le tableau de bord (tous les profils)

Premier écran après connexion. Trois blocs d'indicateurs :

- **Immobiliers** : nombre de biens, taux d'occupation, biens libres/en
  travaux.
- **Financiers** : chiffre d'affaires du mois, impayés en cours.
- **Locatifs** : contrats actifs, échéances à venir.

Quatre graphiques complètent la vue : évolution du chiffre d'affaires,
occupation, répartition des biens par type, évolution des impayés.

## 3. Gestionnaire locatif — usage quotidien

C'est le profil qui saisit l'essentiel de l'activité courante.

### 3.1 Biens

*Biens → Nouveau* : renseigner type, désignation, quartier, adresse et
loyer. Le code (ex. `BIEN-000012`) est généré automatiquement. Le statut
(Libre / Occupé / En travaux) change tout seul à la validation ou à la
clôture d'un contrat — il n'y a pas besoin de le changer manuellement dans
le cas normal.

### 3.2 Locataires

*Locataires → Nouveau* : personne physique (nom, prénoms, date de naissance,
pièce d'identité) ou entreprise (raison sociale, représentant). Le
téléphone principal est obligatoire.

À la sortie d'un locataire, utiliser *Archiver* depuis sa fiche — ses
données personnelles sont conservées un an puis supprimées automatiquement
(aucune action à refaire).

### 3.3 Contrats

*Contrats → Nouveau* : sélectionner un bien **libre** et un locataire
**actif**, la durée, le loyer et la caution (2 mois de loyer par défaut,
modifiable). Le contrat est créé en statut **Brouillon** : il n'a aucun
effet tant que le Gérant ne l'a pas validé (le bien reste « Libre », aucune
facture n'est générée).

Une fois validé par le Gérant, le contrat génère automatiquement un PDF
téléchargeable (trame habitation ou commerciale selon le type de
locataire).

**Clôturer un contrat** (départ du locataire) : depuis la fiche contrat,
bouton *Clôturer* — indiquer le motif et, le cas échéant, proposer une
retenue sur la caution avec justification. La décision finale revient au
Gérant.

### 3.4 Paiements

*Paiements → Nouveau* : sélectionner le locataire, la date, le montant et
le mode (espèces, virement, chèque, Mobile Money). **Il n'y a pas de
facture à choisir** : le paiement s'impute automatiquement sur la facture
due la plus ancienne. Une quittance PDF est générée immédiatement.

Une erreur de saisie ne se corrige pas soi-même : elle doit être signalée
au Gérant, seul habilité à valider une correction.

### 3.5 Documents et cautions

*Documents → Nouveau* : coller le lien Google Drive du document (titre
foncier, état des lieux...) et l'associer à un bien, locataire, contrat ou
facture. **Aucun fichier n'est envoyé dans l'application** — seul le lien
est enregistré.

*Cautions* : consultation de l'état de toutes les cautions ; le
Gestionnaire peut y constater une retenue proposée, mais la validation
finale (remboursement ou retenue) revient au Gérant.

## 4. Gérant — validations et pilotage

Le Gérant a les mêmes écrans de consultation que le Gestionnaire, avec en
plus les actions de validation qui engagent l'agence :

| Action | Où | Effet |
|---|---|---|
| Valider un contrat | Fiche contrat, bouton *Valider* | Contrat « Actif », bien « Occupé », facturation possible |
| Valider une révision de loyer | Fiche contrat | Nouveau loyer appliqué aux prochaines factures |
| Corriger un paiement | Fiche paiement, bouton *Corriger* | Montant/mode corrigé, motif conservé |
| Décider du sort d'une caution | Fiche contrat clôturé | Remboursement intégral ou retenue motivée |

Le Gérant reçoit une notification interne (icône en haut de l'écran) à
chaque action en attente de sa validation.

### Rapports et journal d'audit

*Rapports* : 16 rapports (immobiliers, locataires/contrats, financiers,
synthèse), filtrables et exportables en Excel. *Journal d'audit* : historique
de toutes les opérations sensibles (qui, quoi, quand), filtrable par
utilisateur, entité et période.

## 5. Administrateur

En plus de tout ce que voit le Gérant :

### 5.1 Utilisateurs

*Utilisateurs → Nouveau* : créer un compte avec un profil unique
(Administrateur, Gérant, Gestionnaire locatif, ou Consultation). Le mot de
passe initial doit contenir au moins 8 caractères, une majuscule et un
chiffre.

### 5.2 Import de données

*Import de données* : réservé au démarrage ou à une reprise ponctuelle.

1. Télécharger le modèle Excel (bouton en haut de l'écran).
2. Remplir les 3 feuilles (Biens, Locataires, Contrats) en suivant les
   instructions incluses dans le fichier — supprimer les lignes d'exemple.
3. Charger le fichier rempli et cliquer sur *Analyser* : la liste des
   erreurs éventuelles s'affiche (rien n'est encore enregistré).
4. Une fois qu'il n'y a plus d'erreur, cliquer sur *Confirmer l'import*.

Les contrats importés sont considérés comme en cours (actifs) dès l'import.

## 6. Consultation

Accès en lecture seule à l'ensemble des rubriques (biens, locataires,
contrats, factures, paiements, cautions, documents, rapports, tableau de
bord). Aucune action de création, modification ou validation n'est
disponible pour ce profil — utile pour un comptable ou un superviseur qui a
besoin de voir les données sans intervenir.

## 7. Questions fréquentes

**Le bouton que je cherche n'apparaît pas.** Il dépend probablement du
profil connecté (voir tableau ci-dessous) — vérifier le profil affiché en
bas du menu de gauche.

| Fonction | Administrateur | Gérant | Gestionnaire locatif | Consultation |
|---|---|---|---|---|
| Créer/modifier biens, locataires | ✅ | — | ✅ | — |
| Créer un contrat | — | — | ✅ | — |
| Valider un contrat / une révision | — | ✅ | — | — |
| Enregistrer un paiement | — | — | ✅ | — |
| Corriger un paiement | — | ✅ | — | — |
| Décider du sort d'une caution | — | ✅ | — | — |
| Gérer les utilisateurs | ✅ | — | — | — |
| Importer des données | ✅ | — | — | — |
| Consulter (biens, contrats, rapports...) | ✅ | ✅ | ✅ | ✅ |

**Un montant s'affiche sans décimales, est-ce normal ?** Oui — tous les
montants sont en FCFA, une devise qui ne s'affiche jamais avec des
centimes.

**Je suis déconnecté après un moment d'absence.** C'est normal et voulu
(sécurité) : reconnexion en quelques secondes avec les mêmes identifiants.
