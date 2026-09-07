import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import WindowTitleBar from '@/features/shared/components/window/WindowTitleBar'
import WindowActionButton from '@/features/shared/components/window/WindowActionButton'
import { useToneHistogram } from '@/features/biometric-image/hooks/useToneHistogram'
import type { CurvePoint } from '@/features/biometric-image/lib/toneCurve'
import CurveEditor from './CurveEditor'

const WINDOW_WIDTH = 264
const INITIAL_OFFSET = 12

type Position = { x: number; y: number }

type CurveWindowProps = {
  points: CurvePoint[]
  imageUrl?: string | null
  onChange: (points: CurvePoint[]) => void
  onClose: () => void
}

/**
 * La courbe se juge sur la pièce, pas sur elle-même : la fenêtre se déplace
 * pour dégager la zone regardée, au lieu de s'ouvrir au-dessus du canevas
 * comme les panneaux à curseurs.
 */
export default function CurveWindow({ points, imageUrl, onChange, onClose }: CurveWindowProps) {
  const { t } = useTranslation()
  const histogram = useToneHistogram(imageUrl)
  const windowRef = useRef<HTMLDivElement>(null)
  const grab = useRef<Position | null>(null)
  const [position, setPosition] = useState<Position>({ x: INITIAL_OFFSET, y: INITIAL_OFFSET })

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) return
    grab.current = { x: event.clientX - position.x, y: event.clientY - position.y }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveWindow = (event: React.PointerEvent<HTMLDivElement>) => {
    const origin = grab.current
    const bounds = windowRef.current?.offsetParent as HTMLElement | null
    if (!origin || !bounds) return
    const box = windowRef.current!.getBoundingClientRect()
    setPosition({
      x: Math.min(bounds.clientWidth - box.width, Math.max(0, event.clientX - origin.x)),
      y: Math.min(bounds.clientHeight - box.height, Math.max(0, event.clientY - origin.y)),
    })
  }

  const endDrag = () => {
    grab.current = null
  }

  return (
    <div
      ref={windowRef}
      className="absolute z-20 overflow-hidden rounded-md bg-blue-dark-1 shadow-lg"
      style={{ left: position.x, top: position.y, width: WINDOW_WIDTH }}
    >
      <div
        className="cursor-move touch-none select-none"
        onPointerDown={startDrag}
        onPointerMove={moveWindow}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <WindowTitleBar
          title={t('biometricImage.toolbar.tools.curve')}
          icon="curve"
          actions={
            <WindowActionButton icon="closeSmall" label={t('common.window.close')} onClick={onClose} />
          }
        />
      </div>
      <div className="p-3">
        <CurveEditor points={points} histogram={histogram} onChange={onChange} />
      </div>
    </div>
  )
}
