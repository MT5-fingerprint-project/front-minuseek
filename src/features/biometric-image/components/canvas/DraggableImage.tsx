import { useEffect, useRef, useState } from 'react'
import { Image as KonvaImage } from 'react-konva'
import Konva from 'konva'
import type { CanvasFilters } from '@/features/biometric-image/components/toolbar/canvasFilters'
import { FILTER_META } from '@/features/biometric-image/components/toolbar/canvasFilters'

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
}

export default function DraggableImage({ url, stageSize, filters }: DraggableImageProps) {
  const image = useImage(url)
  const imageRef = useRef<Konva.Image>(null)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    imageRef.current?.cache()
    imageRef.current?.getLayer()?.batchDraw()
  }, [filters])

  if (!image) return null

  const scale = Math.min(1, MAX_IMAGE_SIZE / Math.max(image.width, image.height))
  const width = image.width * scale
  const height = image.height * scale
  const centered = {
    x: Math.max(0, (stageSize.width - width) / 2),
    y: Math.max(0, (stageSize.height - height) / 2),
  }

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

  const offsetX = transformProps.scaleX === -1 ? width : width / 2
  const offsetY = height / 2

  const baseX = position?.x ?? centered.x + width / 2
  const baseY = position?.y ?? centered.y + height / 2

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
      draggable
      onDragEnd={(e) => setPosition({ x: e.target.x(), y: e.target.y() })}
      filters={konvaFilters}
      {...filterProps}
      {...transformProps}
    />
  )
}
