import { useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import type { KonvaEventObject } from 'konva/lib/Node'

const DEFAULT_VIEW = { scale: 1, x: 0, y: 0 }
const ZOOM_FACTOR = 1.1
const FIT_PADDING = 24
export const MIN_SCALE = 0.05
export const MAX_SCALE = 100

export type CanvasView = typeof DEFAULT_VIEW

type Size = { width: number; height: number }

export type CanvasZoomHandle = {
  zoomIn: () => void
  zoomOut: () => void
  recenter: () => void
}

type UseCanvasViewOptions = {
  size: Size
  content: Size | null
  zoomHandleRef?: React.RefObject<CanvasZoomHandle | null>
  onScaleChange?: (scale: number) => void
}

function fitScaleOf(content: Size, viewport: Size): number {
  const usableWidth = Math.max(1, viewport.width - FIT_PADDING * 2)
  const usableHeight = Math.max(1, viewport.height - FIT_PADDING * 2)
  return Math.min(usableWidth / Math.max(1, content.width), usableHeight / Math.max(1, content.height))
}

function fitView(content: Size, viewport: Size): CanvasView {
  const scale = fitScaleOf(content, viewport)
  return {
    scale,
    x: (viewport.width - content.width * scale) / 2,
    y: (viewport.height - content.height * scale) / 2,
  }
}

/** Zoom/pan state of the canvas: wheel zoom toward the cursor, button zoom toward the center, recenter. */
export function useCanvasView({ size, content, zoomHandleRef, onScaleChange }: UseCanvasViewOptions) {
  const [view, setView] = useState<CanvasView>(DEFAULT_VIEW)
  // incremented on recenter so the image remounts and resets its drag position
  const [recenterSignal, setRecenterSignal] = useState(0)
  // mirrors `view` so rapid successive zooms (double click) don't read a stale closure
  const viewRef = useRef(view)
  const fittedContentRef = useRef<Size | null>(null)

  const isMeasured = size.width > 0 && size.height > 0
  const minScale = content && isMeasured ? Math.min(MIN_SCALE, fitScaleOf(content, size)) : MIN_SCALE

  const applyView = (next: CanvasView) => {
    viewRef.current = next
    setView(next)
    onScaleChange?.(next.scale)
  }


  useLayoutEffect(() => {
    if (!content || !isMeasured || fittedContentRef.current === content) return
    fittedContentRef.current = content
    applyView(fitView(content, size))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, size, isMeasured])

  // Bound a target scale and apply it while keeping a given point (screen coords) fixed in place.
  const zoomTowardPoint = (point: { x: number; y: number }, targetScale: number) => {
    const current = viewRef.current
    const pointTo = {
      x: (point.x - current.x) / current.scale,
      y: (point.y - current.y) / current.scale,
    }
    const newScale = Math.min(MAX_SCALE, Math.max(minScale, targetScale))
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

  const panTo = (position: { x: number; y: number }) => {
    applyView({ ...viewRef.current, ...position })
  }

  const recenter = () => {
    applyView(content && isMeasured ? fitView(content, size) : DEFAULT_VIEW)
    setRecenterSignal((n) => n + 1)
  }

  useImperativeHandle(zoomHandleRef, () => ({
    zoomIn: () => zoomFromButton(1),
    zoomOut: () => zoomFromButton(-1),
    recenter,
  }))

  return { view, handleWheel, panTo, recenterSignal }
}
