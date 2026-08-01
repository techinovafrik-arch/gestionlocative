# Runbook de mise en production — Sprint 9

> Procédure prête à exécuter dès que le VPS (point ouvert #4,
> `technique/00-cadrage-technique.md §6`) est choisi et accessible en SSH.
> Rien ici ne dépend d'un fournisseur particulier (OVH, Hostinger,
> DigitalOcean...) — seules les étapes 1-2 varient selon l'hébergeur.
> Complète `technique/00-cadrage-technique.md §4` (CI/CD) sans le dupliquer.

## 0. Pré-requis

- VPS Linux Ubuntu (22.04 LTS ou plus récent), 4 Go RAM minimum, SSD (ENF-06).
- Un nom de domaine (ou sous-domaine) pointant vers l'IP du VPS.
- Décisions prises pour au moins l'hébergement (point ouvert #4) ; les
  points ouverts 1-3 (SMS, WhatsApp, email) ne bloquent pas le déploiement —
  ils activent des canaux qui restent en stub sans erreur tant qu'ils ne
  sont pas configurés (`src/lib/notifications/canaux.ts`).

## 1. Provisionnement du VPS (une fois)

```bash
# Connexion initiale
ssh root@<IP_VPS>

# Mises à jour et paquets de base
apt update && apt upgrade -y
apt install -y curl git nginx postgresql postgresql-contrib

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PM2 (process manager)
npm install -g pm2

# Utilisateur applicatif dédié (ne pas déployer en root)
adduser --disabled-password gestionlocative
usermod -aG sudo gestionlocative
```

## 2. Base de données

```bash
sudo -u postgres psql -c "CREATE ROLE gestionlocative WITH LOGIN PASSWORD '<mot_de_passe_fort>' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE gestionlocative OWNER gestionlocative;"
```

`CREATEDB` n'est nécessaire qu'en développement (shadow DB de `prisma migrate
dev`) — en production, `prisma migrate deploy` n'en a pas besoin ; le
retirer une fois la première migration appliquée si l'agence l'exige côté
sécurité (`ALTER ROLE gestionlocative NOCREATEDB;`).

## 3. Premier déploiement (manuel, avant d'activer la CI)

```bash
su - gestionlocative
mkdir -p /var/www/gestionlocative && cd /var/www/gestionlocative
git clone https://github.com/techinovafrik-arch/gestionlocative.git .
npm ci
```

Créer `/var/www/gestionlocative/.env` (jamais commité) à partir de
`technique/00-cadrage-technique.md §3.2` :

```
DATABASE_URL="postgresql://gestionlocative:<mot_de_passe>@localhost:5432/gestionlocative"
NEXTAUTH_URL="https://<domaine>"
NEXTAUTH_SECRET="<généré avec: openssl rand -base64 32>"
CRON_SECRET="<généré avec: openssl rand -hex 32>"
# SMTP_*, SMS_*, WHATSAPP_* : à renseigner quand les points ouverts 1-3 sont tranchés
```

```bash
npx prisma migrate deploy
npx prisma db seed          # crée le compte Administrateur initial — le mot de passe affiché ne l'est qu'une fois, le noter en lieu sûr puis le changer
npm run build
pm2 start npm --name gestionlocative -- start
pm2 save
pm2 startup                 # suivre l'instruction affichée pour démarrer PM2 au boot
```

## 4. Nginx (reverse proxy) + HTTPS (ENF-02)

`/etc/nginx/sites-available/gestionlocative` :

```nginx
server {
    listen 80;
    server_name <domaine>;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/gestionlocative /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# HTTPS (Let's Encrypt)
apt install -y certbot python3-certbot-nginx
certbot --nginx -d <domaine>
```

Certbot édite automatiquement la configuration Nginx pour rediriger le HTTP
vers le HTTPS et renouvelle le certificat via un timer systemd — vérifier
`systemctl status certbot.timer` une fois installé (ENF-02 : aucun accès
HTTP non chiffré possible).

## 5. Activer le déploiement continu (CI/CD)

Le job `deploy` de `.github/workflows/ci.yml` est déjà écrit et **inactif**
tant que `vars.VPS_HOST` n'existe pas (condition `if:` du job). Dans
GitHub → Settings → Environments → *production* (ou Secrets and variables →
Actions) :

| Type | Nom | Valeur |
|---|---|---|
| Variable | `VPS_HOST` | IP ou domaine du VPS |
| Variable | `VPS_USER` | `gestionlocative` |
| Secret | `VPS_SSH_KEY` | Clé privée SSH dédiée au déploiement (créer une paire dédiée, ne jamais réutiliser une clé personnelle ; ajouter la clé publique dans `~gestionlocative/.ssh/authorized_keys` sur le VPS) |

Dès `VPS_HOST` renseigné, chaque merge sur `main` exécute automatiquement :
`git pull` → `npm ci` → `prisma migrate deploy` → `npm run build` →
`pm2 restart gestionlocative` (voir le job `deploy`, déjà testé par la
suite CI sur chaque PR avant la fusion).

## 6. Tâches planifiées (cron système)

Les endpoints `/api/cron/*` ne se déclenchent jamais tout seuls — c'est le
planificateur externe qui décide du moment (cf. `technique/MEMORY.md`,
« Idempotence des tâches cron »). Sur le VPS, `crontab -e` (utilisateur
`gestionlocative`) :

```cron
# Facturation automatique le 25 de chaque mois (RG-F01)
0 6 25 * * curl -fsS -X POST https://<domaine>/api/cron/facturation -H "x-cron-secret: <CRON_SECRET>"

# Renouvellement tacite des contrats échus — vérification quotidienne (RG-C04)
0 3 * * * curl -fsS -X POST https://<domaine>/api/cron/renouvellements -H "x-cron-secret: <CRON_SECRET>"

# Alertes échéance + relances impayés — vérification quotidienne (RG-N04)
0 7 * * * curl -fsS -X POST https://<domaine>/api/cron/relances -H "x-cron-secret: <CRON_SECRET>"

# Rapport mensuel au Gérant — le 1er de chaque mois (RG-N05)
0 6 1 * * curl -fsS -X POST https://<domaine>/api/cron/rapport-mensuel -H "x-cron-secret: <CRON_SECRET>"

# Sauvegarde quotidienne, rétention 30 jours (ENF-05, D-039)
0 2 * * * DATABASE_URL="postgresql://gestionlocative:<mot_de_passe>@localhost:5432/gestionlocative" BACKUP_DIR="/var/backups/gestionlocative" /var/www/gestionlocative/scripts/sauvegarde.sh >> /var/log/gestionlocative-sauvegarde.log 2>&1
```

Chaque endpoint cron est idempotent (rejouable sans effet de bord) — un
double déclenchement accidentel ne crée pas de doublon.

## 7. Vérification post-déploiement (à rejouer à chaque mise en production)

- [ ] `https://<domaine>` accessible, aucun avertissement de certificat.
- [ ] Connexion avec le compte Administrateur du seed, changement du mot de
      passe immédiat.
- [ ] Création d'un compte par profil (Gérant, Gestionnaire, Consultation).
- [ ] Un cycle complet bien → contrat → facture → paiement fonctionne
      (cf. `technique/09-recette.md §1`, à rejouer avec des données réelles
      ou fictives selon le contexte).
- [ ] `crontab -l` affiche bien les 5 tâches de la section 6.
- [ ] Une sauvegarde manuelle (`scripts/sauvegarde.sh`) réussit et produit
      un fichier dans `BACKUP_DIR`.
- [ ] Espace disque et charge surveillés (outil à définir —
      `technique/00-cadrage-technique.md §4.2` suggère Uptime Kuma
      auto-hébergé, gratuit et simple à mettre en place sur le même VPS).

## 8. Rollback

En cas d'anomalie bloquante après déploiement :

```bash
ssh gestionlocative@<IP_VPS>
cd /var/www/gestionlocative
git log --oneline -5                # identifier le commit précédent stable
git checkout <commit_stable>
npm ci
npx prisma migrate deploy           # ne recule PAS les migrations — voir note ci-dessous
npm run build
pm2 restart gestionlocative
```

**Migrations** : `prisma migrate deploy` n'annule jamais une migration déjà
appliquée. Un rollback de code après une migration qui a changé le schéma
(colonne ajoutée, etc.) doit rester compatible avec ce schéma — c'est déjà
le cas pour toutes les migrations du projet à ce jour (aucune migration
destructive). Revenir en arrière sur une migration *destructive* future
nécessiterait une restauration de sauvegarde (`scripts/restauration.sh`) et
sort du cadre d'un rollback de code simple.
