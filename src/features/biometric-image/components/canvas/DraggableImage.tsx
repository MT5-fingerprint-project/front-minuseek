import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Image as KonvaImage } from 'react-konva'
import Konva from 'konva'
import type { Filter } from 'konva/lib/Node'
import type { CanvasFilters, KonvaFilterDef } from '@/features/biometric-image/components/toolbar/canvasFilters'
import { FILTER_META } from '@/features/biometric-image/components/toolbar/canvasFilters'

const MAX_CACHE_SIDE = 4096

export type ImageLayout = {
  x: number
  y: number
  offsetX: number
  offsetY: number
  scaleX: number
  scaleY: number
  rotation: number
}

export type SourceGeometry = {
  sourceWidth: number
  sourceHeight: number
}

export type DrawnFrame = {
  width: number
  height: number
}

type FilterEntry = [key: string, value: number]

function activeEntriesOfKind(filters: CanvasFilters | undefined, kind: KonvaFilterDef['type']): FilterEntry[] {
  return Object.entries(filters ?? {}).filter(([key, value]) => value !== 0 && FILTER_META[key]?.konva.type === kind)
}

function useImage(url: string | null | undefined) {
  const [image, setImage] = useState<HTMLImageElement>()

  useEffect(() => {
    if (!url) return
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.src = url
    img.onload = () => setImage(img)
    return () => {
      img.onload = null
    }
  }, [url])

  return image
}

type DraggableImageProps = {
  url: string
  thumbUrl?: string | null
  sourceSize?: DrawnFrame | null
  filters?: CanvasFilters
  isDraggable?: boolean
  viewScale?: number
  onLayoutChange?: (layout: ImageLayout) => void
  onSourceGeometryChange?: (geometry: SourceGeometry) => void
  onDrawnFrameChange?: (frame: DrawnFrame) => void
}

export default function DraggableImage({
  url,
  thumbUrl,
  sourceSize,
  filters,
  isDraggable = true,
  viewScale = 1,
  onLayoutChange,
  onSourceGeometryChange,
  onDrawnFrameChange,
}: DraggableImageProps) {
  const original = useImage(url)
  const thumbnail = useImage(thumbUrl)
  const image = original ?? thumbnail
  const imageRef = useRef<Konva.Image>(null)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)

  const filterSignature = JSON.stringify(activeEntriesOfKind(filters, 'filter'))
  const transformSignature = JSON.stringify(activeEntriesOfKind(filters, 'transform'))

  const { konvaFilters, filterProps } = useMemo(() => {
    const definitions: Filter[] = []
    const props: Record<string, number> = {}
    for (const [key, value] of JSON.parse(filterSignature) as FilterEntry[]) {
      const definition = FILTER_META[key]?.konva
      if (definition?.type !== 'filter') continue
      if (!definitions.includes(definition.filter)) definitions.push(definition.filter)
      if (definition.prop) props[definition.prop] = value * definition.scale
    }
    return { konvaFilters: definitions, filterProps: props }
  }, [filterSignature])

  // Transforms — go as direct Konva node props
  const transformProps = useMemo(() => {
    const props: Record<string, number> = {}
    for (const [key, value] of JSON.parse(transformSignature) as FilterEntry[]) {
      const definition = FILTER_META[key]?.konva
      if (definition?.type !== 'transform') continue
      props[definition.prop] = definition.transform(value)
    }
    return props
  }, [transformSignature])

  // Dessiner dans le repère servi étire la vignette aux dimensions de l'original : la scène
  // est en pixels source dès le premier rendu, les minuties tombent juste et le
  // remplacement ne déplace aucune coordonnée.
  const width = sourceSize?.width ?? image?.width ?? 0
  const height = sourceSize?.height ?? image?.height ?? 0
  const scaleX = transformProps.scaleX ?? 1
  const rotation = transformProps.rotation ?? 0
  // Pivot toujours au centre : le miroir (scaleX = -1) se reflète sur place sans décaler l'image.
  const offsetX = width / 2
  const offsetY = height / 2
  const baseX = position?.x ?? offsetX
  const baseY = position?.y ?? offsetY

  const hasFilter = konvaFilters.length > 0

  // Le cache est rasterisé en pixels physiques : il suit la densité réellement affichée
  // (sans `Konva.pixelRatio`, un écran Retina rendrait l'image filtrée deux fois moins
  // dense que l'image nue, donc plus floue), par paliers de puissance de deux, et sans
  // dépasser la résolution de la source ni MAX_CACHE_SIDE de côté.
  const displayDensity = (viewScale > 0 ? viewScale : 1) * Konva.pixelRatio
  const densityTier = 2 ** Math.ceil(Math.log2(displayDensity))
  const renderedMaxSide = Math.max(width, height)
  const cacheSideLimit = renderedMaxSide > 0 ? MAX_CACHE_SIDE / renderedMaxSide : 1
  const drawnResolutionLimit = image && width > 0 ? image.width / width : 1
  const cachePixelRatio = Math.min(densityTier, 1, cacheSideLimit, drawnResolutionLimit)

  useEffect(() => {
    const node = imageRef.current
    if (!node || !image) return
    node.clearCache()
    if (hasFilter) {
      node.cache({ pixelRatio: cachePixelRatio, hitCanvasPixelRatio: cachePixelRatio })
    }
    node.getLayer()?.batchDraw()
  }, [image, hasFilter, cachePixelRatio])

  // Sans dimensions servies, le repère n'est celui des minuties qu'une fois l'original
  // décodé : la disposition n'est alors rapportée que depuis lui.
  const framedImage = sourceSize != null ? image : original

  useEffect(() => {
    if (!framedImage) return
    onLayoutChange?.({ x: baseX, y: baseY, offsetX, offsetY, scaleX, scaleY: 1, rotation })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [framedImage, baseX, baseY, offsetX, offsetY, scaleX, rotation])

  useLayoutEffect(() => {
    if (!original) return
    onSourceGeometryChange?.({ sourceWidth: original.width, sourceHeight: original.height })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [original])

  useLayoutEffect(() => {
    if (width <= 0 || height <= 0) return
    onDrawnFrameChange?.({ width, height })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height])

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
      draggable={isDraggable && image === original}
      onDragMove={(e) => setPosition({ x: e.target.x(), y: e.target.y() })}
      onDragEnd={(e) => setPosition({ x: e.target.x(), y: e.target.y() })}
      filters={konvaFilters}
      {...filterProps}
      {...transformProps}
    />
  )
}
