import { prisma } from "@/lib/prisma";

// Base de test dédiée (gestionlocative_test) : on la vide avant chaque test
// plutôt que de mocker Prisma, conformément à la politique de test du
// cadrage technique (§4.1) — pas de mock sur les règles métier critiques.
export async function nettoyerBase() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      audits, notifications, documents, quittances, paiements, factures,
      cautions, revisions_loyer, contrats, pieces_identite, locataires,
      biens, quartiers, communes, utilisateurs
    RESTART IDENTITY CASCADE;
  `);
}
