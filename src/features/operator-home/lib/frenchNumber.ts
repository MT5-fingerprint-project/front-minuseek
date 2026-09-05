// Le rapport écrit « l'examen dactyloscopique de NEUF (9) traces papillaires » :
// la quantité est doublée en lettres puis en chiffres. C'est un dispositif
// anti-falsification d'acte écrit, que l'accueil reprend pour sa phrase d'entrée.
// Au-delà de trois chiffres on n'épelle plus : la ligne deviendrait illisible.
export const SPELLING_LIMIT = 999

const UNITS = [
  'zéro',
  'une',
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
  'dix',
  'onze',
  'douze',
  'treize',
  'quatorze',
  'quinze',
  'seize',
]

const TENS: Record<number, string> = {
  2: 'vingt',
  3: 'trente',
  4: 'quarante',
  5: 'cinquante',
  6: 'soixante',
}

function belowHundred(count: number): string {
  if (count < 17) return UNITS[count]
  if (count < 20) return `dix-${UNITS[count - 10]}`

  if (count < 70) {
    const tens = Math.floor(count / 10)
    const unit = count % 10
    if (unit === 0) return TENS[tens]
    if (unit === 1) return `${TENS[tens]} et une`
    return `${TENS[tens]}-${UNITS[unit]}`
  }

  // Soixante-dix se dit « soixante » plus « dix » : la liaison « et » ne survit
  // qu'à soixante et onze, jamais à quatre-vingt-onze.
  if (count < 80) {
    if (count === 71) return 'soixante et onze'
    return `soixante-${belowHundred(count - 60)}`
  }

  if (count === 80) return 'quatre-vingts'
  if (count < 90) return `quatre-vingt-${UNITS[count - 80]}`
  return `quatre-vingt-${belowHundred(count - 80)}`
}

/** Épelle une quantité au féminin — une trace, une identification. */
export function spellFeminine(count: number): string | null {
  if (!Number.isInteger(count) || count < 0 || count > SPELLING_LIMIT) return null
  if (count === 0) return 'aucune'
  if (count < 100) return belowHundred(count)

  const hundreds = Math.floor(count / 100)
  const rest = count % 100
  const prefix = hundreds === 1 ? 'cent' : `${UNITS[hundreds]} cent`

  // « Deux cents » prend l's, « deux cent une » ne le prend pas : le pluriel de
  // cent ne survit pas à ce qui le suit.
  if (rest === 0) return hundreds === 1 ? prefix : `${prefix}s`
  return `${prefix} ${belowHundred(rest)}`
}
