import { prisma } from "@/lib/prisma";
import { notifierStaff } from "@/lib/notifications/interne";

// RG-N05 : rapport mensuel automatique envoyé au gérant (synthèses
// immobilière, financière, alertes). L'envoi email reste en stub (voir
// lib/notifications/canaux.ts) ; la notification interne est fonctionnelle.
export async function genererRapportMensuel(maintenant = new Date()) {
  const [totalBiens, biensOccupes, biensLibres, biensTravaux] = await Promise.all([
    prisma.bien.count(),
    prisma.bien.count({ where: { statut: "occupe" } }),
    prisma.bien.count({ where: { statut: "libre" } }),
    prisma.bien.count({ where: { statut: "en_travaux" } }),
  ]);
  const tauxOccupation = totalBiens > 0 ? Math.round((biensOccupes / totalBiens) * 100) : 0;

  const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
  const finMois = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 1);

  const facturesDuMois = await prisma.facture.findMany({
    where: { dateEmission: { gte: debutMois, lt: finMois } },
    select: { totalAPayer: true, montantPaye: true },
  });
  const loyersAttendus = facturesDuMois.reduce((total, f) => total + Number(f.totalAPayer), 0);
  const loyersEncaisses = facturesDuMois.reduce((total, f) => total + Number(f.montantPaye), 0);

  const facturesImpayees = await prisma.facture.count({ where: { statut: "impayee" } });

  const dans30Jours = new Date(maintenant);
  dans30Jours.setDate(dans30Jours.getDate() + 30);
  const contratsAEcheance = await prisma.contrat.count({
    where: { statut: "actif", dateFin: { gte: maintenant, lte: dans30Jours } },
  });

  const synthese = {
    totalBiens,
    biensOccupes,
    biensLibres,
    biensTravaux,
    tauxOccupation,
    loyersAttendus,
    loyersEncaisses,
    facturesImpayees,
    contratsAEcheance,
  };

  const message = [
    `Synthèse immobilière : ${totalBiens} biens (${biensOccupes} occupés, ${biensLibres} libres, ${biensTravaux} en travaux) — taux d'occupation ${tauxOccupation}%.`,
    `Synthèse financière (mois en cours) : ${loyersAttendus.toLocaleString("fr-FR")} FCFA attendus, ${loyersEncaisses.toLocaleString("fr-FR")} FCFA encaissés.`,
    `Alertes : ${facturesImpayees} facture(s) impayée(s), ${contratsAEcheance} contrat(s) arrivant à échéance sous 30 jours.`,
  ].join(" ");

  await notifierStaff({
    profils: ["gerant"],
    type: "information",
    titre: `Rapport mensuel — ${maintenant.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`,
    message,
  });

  return synthese;
}
