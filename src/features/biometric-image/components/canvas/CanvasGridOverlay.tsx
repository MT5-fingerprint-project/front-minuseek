/** Repères en tiers : 2 lignes verticales + 2 horizontales (rouge), en overlay écran */
const THIRDS = ['33.333%', '66.666%']

export default function CanvasGridOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {THIRDS.map((pos) => (
        <div key={`v-${pos}`} className="absolute top-0 bottom-0 w-px bg-red-medium" style={{ left: pos }} />
      ))}
      {THIRDS.map((pos) => (
        <div key={`h-${pos}`} className="absolute left-0 right-0 h-px bg-red-medium" style={{ top: pos }} />
      ))}
    </div>
  )
}
