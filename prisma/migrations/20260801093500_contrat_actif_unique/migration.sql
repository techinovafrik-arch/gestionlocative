-- Un seul contrat "actif" par bien (RG-B05, dossier/09-mcd.md, dossier/10-mld.md §10.3).
-- Non exprimable nativement dans schema.prisma (index partiel) : appliqué ici en SQL brut.
CREATE UNIQUE INDEX "ux_contrats_bien_actif" ON "contrats" ("bien_id") WHERE "statut" = 'actif';
