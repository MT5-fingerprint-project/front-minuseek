const ARROW_TO_RADIUS = 14 / 6

export function edgeAndTip(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const tipDistance = radius * (1 + ARROW_TO_RADIUS)
  return {
    edge: { x: cos * radius, y: sin * radius },
    tip:  { x: cos * tipDistance, y: sin * tipDistance },
  }
}

export function angleFromOffset(dx: number, dy: number) {
  return (((Math.atan2(dy, dx) * 180) / Math.PI + 90) % 360 + 360) % 360
}
