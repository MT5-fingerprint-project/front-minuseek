import { useImperativeHandle, useRef, useState } from 'react'
import type { KonvaEventObject } from 'konva/lib/Node'

const DEFAULT_VIEW = { scale: 1, x: 0, y: 0 }
const ZOOM_FACTOR = 1.1
// Bornes élargies pour couvrir un recadrage serré comme une grande scène.
export const MIN_SCALE = 0.05
export const MAX_SCALE = 100

export type CanvasView = typeof DEFAULT_VIEW

export type CanvasZoomHandle = {
  zoomIn: () => void
  zoomOut: () => void
  recenter: () => void
}

type UseCanvasViewOptions = {
  size: { width: number; height: number }
  zoomHandleRef?: React.RefObject<CanvasZoomHandle | null>
  onScaleChange?: (scale: number) => void
}

/** Zoom/pan state of the canvas: wheel zoom toward the cursor, button zoom toward the center, recenter. */
export function useCanvasView({ size, zoomHandleRef, onScaleChange }: UseCanvasViewOptions) {
  const [view, setView] = useState<CanvasView>(DEFAULT_VIEW)
  // incremented on recenter so the image remounts and resets its drag position
  const [recenterSignal, setRecenterSignal] = useState(0)
  // mirrors `view` so rapid successive zooms (double click) don't read a stale closure
  const viewRef = useRef(view)

  const applyView = (next: CanvasView) => {
    viewRef.current = next
    setView(next)
    onScaleChange?.(next.scale)
  }

  // Bound a target scale and apply it while keeping a given point (screen coords) fixed in place.
  const zoomTowardPoint = (point: { x: number; y: number }, targetScale: number) => {
    const current = viewRef.current
    const pointTo = {
      x: (point.x - current.x) / current.scale,
      y: (point.y - current.y) / current.scale,
    }
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, targetScale))
    applyView({
      scale: newScale,
      x: point.x - pointTo.x * newScale,
      y: point.y - pointTo.y * newScale,
    })
  }

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const pointer = e.target.getStage()?.getPointerPosition()
    if (!pointer) return
    const current = viewRef.current
    zoomTowardPoint(pointer, current.scale * ZOOM_FACTOR ** (e.evt.deltaY > 0 ? -1 : 1))
  }

  const zoomFromButton = (direction: 1 | -1) => {
    const current = viewRef.current
    zoomTowardPoint({ x: size.width / 2, y: size.height / 2 }, current.scale * ZOOM_FACTOR ** direction)
  }

  const recenter = () => {
    applyView(DEFAULT_VIEW)
    setRecenterSignal((n) => n + 1)
  }

  useImperativeHandle(zoomHandleRef, () => ({
    zoomIn: () => zoomFromButton(1),
    zoomOut: () => zoomFromButton(-1),
    recenter,
  }))

  return { view, handleWheel, recenterSignal }
}
