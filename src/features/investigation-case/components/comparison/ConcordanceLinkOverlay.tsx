import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { MinutiaPair } from '@/features/investigation-case/types/minutiaPair'

const LINK_COLOR = '#D85703'
const LINK_STROKE_WIDTH = 2.5
const LINK_STROKE_WIDTH_ACTIVE = 4

type ScreenPosition = { x: number; y: number }

type ConcordanceLinkOverlayProps = {
  isActive: boolean
  /** Paires à relier, dans l'ordre de révélation (révélées + la paire en cours d'entrée). */
  pairs: MinutiaPair[]
  activePairId: string | null
  getTracePosition: (minutiaId: string) => ScreenPosition | null
  getReferencePosition: (minutiaId: string) => ScreenPosition | null
}

/**
 * Trait de liaison entre les deux fenêtres du comparateur (deux `<Stage>` Konva
 * distincts, potentiellement une fenêtre détachée) : un `<Line>` Konva interne
 * à un seul Stage ne peut pas les relier. Overlay SVG porté au-dessus de toute
 * la page ; une boucle `requestAnimationFrame` relit les positions écran et
 * mute les attributs DOM directement, sans passer par le state React — c'est
 * ce qui garde le zoom/pan de chaque canevas utilisable pendant la lecture
 * sans que le trait se désynchronise ni ne saccade.
 */
export default function ConcordanceLinkOverlay({
  isActive,
  pairs,
  activePairId,
  getTracePosition,
  getReferencePosition,
}: ConcordanceLinkOverlayProps) {
  const linesRef = useRef(new Map<string, SVGLineElement>())

  // Refs "dernière valeur" : évite de redémarrer la boucle rAF à chaque rendu
  // du parent (mêmes fonctions recréées à l'identique par la page).
  const getTraceRef = useRef(getTracePosition)
  const getReferenceRef = useRef(getReferencePosition)
  useEffect(() => {
    getTraceRef.current = getTracePosition
    getReferenceRef.current = getReferencePosition
  })

  useEffect(() => {
    if (!isActive) return

    let frameId: number
    const tick = () => {
      for (const pair of pairs) {
        const line = linesRef.current.get(pair.id)
        if (!line) continue
        const from = getTraceRef.current(pair.traceMinutiaLayerId)
        const to = getReferenceRef.current(pair.referenceMinutiaLayerId)
        if (!from || !to) {
          line.style.visibility = 'hidden'
          continue
        }
        line.style.visibility = 'visible'
        line.setAttribute('x1', String(from.x))
        line.setAttribute('y1', String(from.y))
        line.setAttribute('x2', String(to.x))
        line.setAttribute('y2', String(to.y))
      }
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [isActive, pairs])

  if (!isActive) return null

  return createPortal(
    <svg className="pointer-events-none fixed inset-0 z-[999] h-screen w-screen">
      {pairs.map((pair) => (
        <line
          key={pair.id}
          ref={(node) => {
            if (node) linesRef.current.set(pair.id, node)
            else linesRef.current.delete(pair.id)
          }}
          stroke={LINK_COLOR}
          strokeWidth={pair.id === activePairId ? LINK_STROKE_WIDTH_ACTIVE : LINK_STROKE_WIDTH}
          strokeLinecap="round"
          className="transition-[stroke-width,opacity] duration-300"
        />
      ))}
    </svg>,
    document.body
  )
}
