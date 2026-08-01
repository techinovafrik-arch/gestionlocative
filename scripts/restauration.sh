#!/usr/bin/env bash
# ENF-05, D-039 : restauration d'une sauvegarde produite par sauvegarde.sh —
# à tester périodiquement (pas seulement au moment d'un incident réel).
#
# Usage : DATABASE_URL=postgres://... ./scripts/restauration.sh backups/gestionlocative-20260801-020000.sql.gz

set -euo pipefail

: "${DATABASE_URL:?Variable DATABASE_URL requise (chaîne de connexion Postgres cible).}"
FICHIER="${1:?Usage: restauration.sh <fichier .sql.gz>}"

if [ ! -f "$FICHIER" ]; then
  echo "Fichier introuvable : $FICHIER" >&2
  exit 1
fi

echo "Restauration de $FICHIER vers $DATABASE_URL"
gunzip -c "$FICHIER" | psql "$DATABASE_URL"
echo "Restauration terminée."
