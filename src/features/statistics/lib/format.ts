const FRENCH_LOCALE = 'fr-FR'
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

export function formatCount(value: number): string {
  return value.toLocaleString(FRENCH_LOCALE)
}

export function formatDayCount(value: number): string {
  return Math.round(value).toLocaleString(FRENCH_LOCALE)
}

export function formatDecimal(value: number): string {
  return value.toLocaleString(FRENCH_LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

export function formatShortDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(FRENCH_LOCALE)
}

export function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split('-')
  return new Date(Number(year), Number(monthNumber) - 1, 1).toLocaleDateString(FRENCH_LOCALE, { month: 'short' })
}

export function yearOf(isoDate: string): number {
  return new Date(isoDate).getFullYear()
}

export function daysSince(isoDate: string): number {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / MILLISECONDS_PER_DAY)
}
