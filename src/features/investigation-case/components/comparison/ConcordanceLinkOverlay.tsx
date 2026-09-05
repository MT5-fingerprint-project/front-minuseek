import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { MinutiaPair } from '@/features/investigation-case/types/minutiaPair'
import { LINK_COLOR, LINK_STROKE_WIDTH } from '@/features/investigation-case/lib/concordanceLinkStyle'

type ScreenPosition = { x: number; y: number }

type ConcordanceLinkOverlayProps = {
  isActive: boolean
  /** Paires révélées, dans l'ordre : seule celle qui porte `activePairId` est reliée. */
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
 *
 * Un seul trait est tracé, celui de la paire commentée : douze traits simultanés
 * font un filet illisible, et la démonstration se lit repère par repère.
 */
export default function ConcordanceLinkOverlay({
  isActive,
  pairs,
  activePairId,
  getTracePosition,
  getReferencePosition,
}: ConcordanceLinkOverlayProps) {
  const lineRef = useRef<SVGLineElement | null>(null)

  // Refs "dernière valeur" : évite de redémarrer la boucle rAF à chaque rendu
  // du parent (mêmes fonctions recréées à l'identique par la page).
  const getTraceRef = useRef(getTracePosition)
  const getReferenceRef = useRef(getReferencePosition)
  const shownRef = useRef<MinutiaPair | undefined>(undefined)
  useEffect(() => {
    getTraceRef.current = getTracePosition
    getReferenceRef.current = getReferencePosition
    shownRef.current = pairs.find((pair) => pair.id === activePairId)
  })

  useEffect(() => {
    if (!isActive) return

    let frameId: number
    const tick = () => {
      const line = lineRef.current
      const shown = shownRef.current
      if (line) {
        const from = shown ? getTraceRef.current(shown.traceMinutiaLayerId) : null
        const to = shown ? getReferenceRef.current(shown.referenceMinutiaLayerId) : null
        if (!from || !to) {
          line.style.visibility = 'hidden'
        } else {
          line.style.visibility = 'visible'
          line.setAttribute('x1', String(from.x))
          line.setAttribute('y1', String(from.y))
          line.setAttribute('x2', String(to.x))
          line.setAttribute('y2', String(to.y))
        }
      }
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [isActive])

  if (!isActive) return null

  return createPortal(
    <svg className="pointer-events-none fixed inset-0 z-[999] h-screen w-screen">
      <line
        ref={lineRef}
        style={{ visibility: 'hidden' }}
        stroke={LINK_COLOR}
        strokeWidth={LINK_STROKE_WIDTH}
        strokeLinecap="round"
      />
    </svg>,
    document.body
  )
}
