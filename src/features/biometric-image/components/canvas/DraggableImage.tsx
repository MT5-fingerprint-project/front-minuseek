import { useEffect, useRef, useState } from 'react'
import { Image as KonvaImage } from 'react-konva'
import Konva from 'konva'
import type { CanvasFilters } from '@/features/biometric-image/components/toolbar/canvasFilters'
import { FILTER_META } from '@/features/biometric-image/components/toolbar/canvasFilters'

export type ImageLayout = {
  x: number
  y: number
  offsetX: number
  offsetY: number
  scaleX: number
  scaleY: number
  rotation: number
}

function useImage(url: string) {
  const [image, setImage] = useState<HTMLImageElement>()

  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.src = url
    img.onload = () => setImage(img)
    return () => {
      img.onload = null
      setImage(undefined)
    }
  }, [url])

  return image
}

const MAX_IMAGE_SIZE = 400

type DraggableImageProps = {
  url: string
  stageSize: { width: number; height: number }
  filters?: CanvasFilters
  draggable?: boolean
  onLayoutChange?: (layout: ImageLayout) => void
}

export default function DraggableImage({ url, stageSize, filters, draggable = true, onLayoutChange }: DraggableImageProps) {
  const image = useImage(url)
  const imageRef = useRef<Konva.Image>(null)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    imageRef.current?.cache()
    imageRef.current?.getLayer()?.batchDraw()
  }, [filters])

  const activeKeys = Object.keys(filters ?? {}).filter((k) => (filters?.[k] ?? 0) !== 0)

  const konvaFilters = activeKeys.flatMap((k) => {
    const def = FILTER_META[k]?.konva
    return def?.type === 'filter' ? [def.filter] : []
  })
  const filterProps = Object.fromEntries(
    activeKeys.flatMap((k) => {
      const def = FILTER_META[k]?.konva
      if (def?.type !== 'filter' || !def.prop) return []
      return [[def.prop, filters![k] * def.scale]]
    }),
  )

  // Transforms — go as direct Konva node props
  const transformProps = Object.fromEntries(
    activeKeys.flatMap((k) => {
      const def = FILTER_META[k]?.konva
      if (def?.type !== 'transform') return []
      return [[def.prop, def.transform(filters![k])]]
    }),
  )

  // Geometry — shared by the rendered image and the layout reported for annotation anchoring
  const scale = image ? Math.min(1, MAX_IMAGE_SIZE / Math.max(image.width, image.height)) : 0
  const width = image ? image.width * scale : 0
  const height = image ? image.height * scale : 0
  const centered = {
    x: Math.max(0, (stageSize.width - width) / 2),
    y: Math.max(0, (stageSize.height - height) / 2),
  }
  const scaleX = (transformProps.scaleX as number) ?? 1
  const rotation = (transformProps.rotation as number) ?? 0
  // Pivot toujours au centre : le miroir (scaleX = -1) se reflète sur place sans décaler l'image.
  const offsetX = width / 2
  const offsetY = height / 2
  const baseX = position?.x ?? centered.x + width / 2
  const baseY = position?.y ?? centered.y + height / 2

  useEffect(() => {
    if (!image) return
    onLayoutChange?.({ x: baseX, y: baseY, offsetX, offsetY, scaleX, scaleY: 1, rotation })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, baseX, baseY, offsetX, offsetY, scaleX, rotation])

  if (!image) return null

  return (
    <KonvaImage
      ref={imageRef}
      image={image}
      x={baseX}
      y={baseY}
      width={width}
      height={height}
      offsetX={offsetX}
      offsetY={offsetY}
      draggable={draggable}
      onDragMove={(e) => setPosition({ x: e.target.x(), y: e.target.y() })}
      onDragEnd={(e) => setPosition({ x: e.target.x(), y: e.target.y() })}
      filters={konvaFilters}
      {...filterProps}
      {...transformProps}
    />
  )
}
