import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { PrismaClient } from "../src/generated/prisma";

// Données de démonstration fictives (aucune donnée personnelle réelle —
// conforme à CLAUDE.md). À ne jamais exécuter tel quel en production sans
// adapter le compte administrateur initial.

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Communes / quartiers de référence (D-029, CDC §1.1).
  const treichville = await prisma.commune.upsert({
    where: { nom: "Treichville" },
    update: {},
    create: { nom: "Treichville" },
  });
  const marcory = await prisma.commune.upsert({
    where: { nom: "Marcory" },
    update: {},
    create: { nom: "Marcory" },
  });

  const zoneIII = await prisma.quartier.upsert({
    where: { communeId_nom: { communeId: treichville.id, nom: "Zone III" } },
    update: {},
    create: { communeId: treichville.id, nom: "Zone III" },
  });
  const zoneIV = await prisma.quartier.upsert({
    where: { communeId_nom: { communeId: marcory.id, nom: "Zone IV" } },
    update: {},
    create: { communeId: marcory.id, nom: "Zone IV" },
  });

  // Compte Administrateur initial (mot de passe généré, affiché une seule fois).
  const emailAdmin = "admin@cimec.local";
  const motDePasseGenere = crypto.randomBytes(9).toString("base64url") + "A1";
  const administrateurExistant = await prisma.utilisateur.findUnique({
    where: { email: emailAdmin },
  });

  if (!administrateurExistant) {
    await prisma.utilisateur.create({
      data: {
        nom: "Administrateur CIMEC",
        email: emailAdmin,
        motDePasseHash: await bcrypt.hash(motDePasseGenere, 12),
        profil: "administrateur",
      },
    });
    console.log("Compte administrateur créé :");
    console.log(`  email        : ${emailAdmin}`);
    console.log(`  mot de passe : ${motDePasseGenere}`);
    console.log("  (à changer après la première connexion)");
  }

  // Biens et locataires de démonstration (données fictives).
  await prisma.bien.upsert({
    where: { code: "BIEN-000001" },
    update: {},
    create: {
      code: "BIEN-000001",
      type: "appartement",
      designation: "Appartement 3 pièces - Résidence Les Palmiers",
      description: "Appartement fictif de démonstration.",
      quartierId: zoneIII.id,
      adresse: "12 rue des Palmiers",
      loyer: 150000,
      chargesMensuelles: 10000,
      statut: "libre",
    },
  });

  await prisma.bien.upsert({
    where: { code: "BIEN-000002" },
    update: {},
    create: {
      code: "BIEN-000002",
      type: "magasin",
      designation: "Magasin - Centre commercial Zone 4",
      description: "Local commercial fictif de démonstration.",
      quartierId: zoneIV.id,
      adresse: "45 avenue du Commerce",
      loyer: 300000,
      chargesMensuelles: 20000,
      statut: "libre",
    },
  });

  await prisma.locataire.upsert({
    where: { code: "LOC-000001" },
    update: {},
    create: {
      code: "LOC-000001",
      type: "physique",
      civilite: "M.",
      nom: "Kouassi",
      prenoms: "Jean",
      dateNaissance: new Date("1985-04-12"),
      nationalite: "Ivoirienne",
      profession: "Enseignant",
      telephonePrincipal: "+225 07 00 00 00 00",
      email: "jean.kouassi.demo@example.com",
      statut: "actif",
      piecesIdentite: {
        create: { type: "cni", numero: "CI-DEMO-0001", dateExpiration: new Date("2030-01-01") },
      },
    },
  });

  console.log("Seed terminé.");
}

main()
  .catch((erreur) => {
    console.error(erreur);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
