export type CurvePoint = { x: number; y: number }

export const CURVE_LEVELS = 256
export const CURVE_MAX_LEVEL = 255

export const DEFAULT_CURVE_POINTS: CurvePoint[] = [
  { x: 0, y: 0 },
  { x: CURVE_MAX_LEVEL, y: CURVE_MAX_LEVEL },
]

export function isIdentityCurve(points: CurvePoint[] | null | undefined): boolean {
  if (!points || points.length < 2) return true
  return points.every((point) => point.x === point.y)
}

export function sortedCurvePoints(points: CurvePoint[]): CurvePoint[] {
  const byInput = new Map<number, number>()
  for (const point of points) {
    const input = Math.round(Math.min(CURVE_MAX_LEVEL, Math.max(0, point.x)))
    const output = Math.round(Math.min(CURVE_MAX_LEVEL, Math.max(0, point.y)))
    byInput.set(input, output)
  }
  return [...byInput.entries()]
    .sort(([left], [right]) => left - right)
    .map(([x, y]) => ({ x, y }))
}

/**
 * Table de correspondance des 256 niveaux, interpolée en cubique monotone
 * (Fritsch-Carlson) : une spline ordinaire déborderait entre deux points de
 * contrôle et rendrait la courbe non croissante, donc un niveau sombre plus
 * clair que son voisin. Le rapport rejoue cette fonction à l'identique
 * (`back-minuseek/app/src/reporting/infrastructure/pdf/tone-curve.ts`) : toute
 * retouche du calcul doit être portée des deux côtés.
 */
export function buildCurveLut(points: CurvePoint[]): Uint8ClampedArray {
  const lut = new Uint8ClampedArray(CURVE_LEVELS)
  const knots = sortedCurvePoints(points)

  if (knots.length === 0) {
    for (let level = 0; level < CURVE_LEVELS; level += 1) lut[level] = level
    return lut
  }
  if (knots.length === 1) {
    lut.fill(knots[0].y)
    return lut
  }

  const count = knots.length
  const slopes: number[] = []
  for (let index = 0; index < count - 1; index += 1) {
    slopes.push((knots[index + 1].y - knots[index].y) / (knots[index + 1].x - knots[index].x))
  }

  const tangents: number[] = new Array(count)
  tangents[0] = slopes[0]
  tangents[count - 1] = slopes[count - 2]
  for (let index = 1; index < count - 1; index += 1) {
    tangents[index] =
      slopes[index - 1] * slopes[index] <= 0 ? 0 : (slopes[index - 1] + slopes[index]) / 2
  }
  for (let index = 0; index < count - 1; index += 1) {
    if (slopes[index] === 0) {
      tangents[index] = 0
      tangents[index + 1] = 0
      continue
    }
    const left = tangents[index] / slopes[index]
    const right = tangents[index + 1] / slopes[index]
    const norm = left * left + right * right
    if (norm > 9) {
      const scale = 3 / Math.sqrt(norm)
      tangents[index] = scale * left * slopes[index]
      tangents[index + 1] = scale * right * slopes[index]
    }
  }

  let segment = 0
  for (let level = 0; level < CURVE_LEVELS; level += 1) {
    if (level <= knots[0].x) {
      lut[level] = knots[0].y
      continue
    }
    if (level >= knots[count - 1].x) {
      lut[level] = knots[count - 1].y
      continue
    }
    while (segment < count - 2 && level > knots[segment + 1].x) segment += 1
    const span = knots[segment + 1].x - knots[segment].x
    const ratio = (level - knots[segment].x) / span
    const squared = ratio * ratio
    const cubed = squared * ratio
    lut[level] =
      knots[segment].y * (2 * cubed - 3 * squared + 1) +
      span * tangents[segment] * (cubed - 2 * squared + ratio) +
      knots[segment + 1].y * (-2 * cubed + 3 * squared) +
      span * tangents[segment + 1] * (cubed - squared)
  }

  return lut
}
