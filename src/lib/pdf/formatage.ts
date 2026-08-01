export function formaterFcfa(montant: unknown) {
  return `${Number(montant).toLocaleString("fr-FR")} FCFA`;
}

export function formaterDate(date: Date) {
  return new Date(date).toLocaleDateString("fr-FR");
}
