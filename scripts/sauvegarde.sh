#!/usr/bin/env bash
# ENF-05, D-039 : sauvegarde automatique quotidienne de la base, rétention 30
# jours. Destiné à être appelé par une tâche cron sur le VPS de production
# (point ouvert #4, technique/STATE.md) — sans dépendance à l'application
# Next.js elle-même (accès direct à Postgres via pg_dump).
#
# Usage : DATABASE_URL=postgres://... ./scripts/sauvegarde.sh
# Cron (exemple, 2h du matin) :
#   0 2 * * * DATABASE_URL=postgres://... BACKUP_DIR=/var/backups/gestionlocative /chemin/vers/scripts/sauvegarde.sh >> /var/log/gestionlocative-sauvegarde.log 2>&1

set -euo pipefail

: "${DATABASE_URL:?Variable DATABASE_URL requise (chaîne de connexion Postgres).}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_JOURS="${RETENTION_JOURS:-30}"

mkdir -p "$BACKUP_DIR"

HORODATAGE="$(date +%Y%m%d-%H%M%S)"
FICHIER="$BACKUP_DIR/gestionlocative-$HORODATAGE.sql.gz"

pg_dump "$DATABASE_URL" | gzip > "$FICHIER"

echo "Sauvegarde créée : $FICHIER ($(du -h "$FICHIER" | cut -f1))"

# Rétention : supprime les sauvegardes plus vieilles que RETENTION_JOURS jours.
find "$BACKUP_DIR" -name 'gestionlocative-*.sql.gz' -mtime "+$RETENTION_JOURS" -print -delete
