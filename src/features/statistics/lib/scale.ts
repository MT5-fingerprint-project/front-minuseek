const NICE_STEP_FACTORS = [1, 2, 2.5, 4, 5, 10]

export function percentOf(value: number, maximum: number): number {
  return maximum > 0 ? Math.min(100, (value / maximum) * 100) : 0
}

export function gridTicks(maximum: number): number[] {
  if (maximum <= 0) {
    return [0]
  }
  const halfway = maximum / 2
  const magnitude = 10 ** Math.floor(Math.log10(halfway))
  const roundCandidates = NICE_STEP_FACTORS.map((factor) => factor * magnitude).filter(
    (candidate) => candidate <= halfway
  )
  const step = Math.max(1, Math.floor(roundCandidates.at(-1) ?? magnitude))
  return [0, step, step * 2].filter((tick) => tick <= maximum)
}
