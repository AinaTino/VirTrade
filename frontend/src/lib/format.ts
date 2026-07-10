export function formatMontant(valeur: number): string {
  return valeur.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    // Le simulateur backend calcule les cours avec quatre décimales. Les
    // conserver ici rend les variations de prix visibles à chaque tick.
    maximumFractionDigits: 4,
  })
}

export function formatNombre(valeur: number, decimales = 2): string {
  return valeur.toLocaleString('fr-FR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}

export function formatPourcentage(valeur?: number | null): string {
  const v = typeof valeur === 'number' && !isNaN(valeur) ? valeur : 0
  const signe = v > 0 ? '+' : ''
  return `${signe}${v.toFixed(2)}%`
}

export function formatHeure(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
