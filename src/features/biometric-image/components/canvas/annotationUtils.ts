const LINE_LENGTH = 14

export function edgeAndTip(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return {
    edge: { x: cos * radius, y: sin * radius },
    tip:  { x: cos * (radius + LINE_LENGTH), y: sin * (radius + LINE_LENGTH) },
  }
}

export function angleFromOffset(dx: number, dy: number) {
  return (((Math.atan2(dy, dx) * 180) / Math.PI + 90) % 360 + 360) % 360
}
