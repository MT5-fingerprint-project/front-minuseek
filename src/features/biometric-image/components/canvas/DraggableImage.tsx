import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Image as KonvaImage } from 'react-konva'
import Konva from 'konva'
import type { Filter } from 'konva/lib/Node'
import type { CanvasFilters, KonvaFilterDef } from '@/features/biometric-image/components/toolbar/canvasFilters'
import { FILTER_META } from '@/features/biometric-image/components/toolbar/canvasFilters'

// Au-delà, le canvas hors écran approche des limites du navigateur (Safari en premier),
// qui rend alors une surface vide sans lever d'erreur.
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

/** Dimensions naturelles de l'image source, qui sont aussi son repère de rendu. */
export type SourceGeometry = {
  sourceWidth: number
  sourceHeight: number
}

type FilterEntry = [key: string, value: number]

function activeEntriesOfKind(filters: CanvasFilters | undefined, kind: KonvaFilterDef['type']): FilterEntry[] {
  return Object.entries(filters ?? {}).filter(([key, value]) => value !== 0 && FILTER_META[key]?.konva.type === kind)
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

type DraggableImageProps = {
  url: string
  filters?: CanvasFilters
  isDraggable?: boolean
  viewScale?: number
  onLayoutChange?: (layout: ImageLayout) => void
  onSourceGeometryChange?: (geometry: SourceGeometry) => void
}

export default function DraggableImage({
  url,
  filters,
  isDraggable = true,
  viewScale = 1,
  onLayoutChange,
  onSourceGeometryChange,
}: DraggableImageProps) {
  const image = useImage(url)
  const imageRef = useRef<Konva.Image>(null)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)

  const filterSignature = JSON.stringify(activeEntriesOfKind(filters, 'filter'))
  const transformSignature = JSON.stringify(activeEntriesOfKind(filters, 'transform'))

  // Reposer l'attribut `filters` d'un nœud Konva invalide sa passe de filtrage : garder
  // l'identité du tableau stable rend un déplacement ou un zoom gratuits, et la faire
  // changer avec la signature refiltre dès qu'une valeur bouge — les filtres maison lisent
  // des attributs que Konva ne connaît pas, ils ne se réappliquent pas d'eux-mêmes.
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

  // L'image est rendue à sa taille naturelle : le repère de la scène est celui des pixels
  // source, et l'ajustement au conteneur vit dans l'échelle du Stage.
  const width = image?.width ?? 0
  const height = image?.height ?? 0
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
  const cachePixelRatio = Math.min(densityTier, 1, cacheSideLimit)

  // Konva n'applique les filtres que sur un nœud caché : on (re)cache quand un
  // filtre est actif, on vide le cache sinon (rendu brut net, réversible à 0).
  // `cache()` abandonne les canvas précédents sans les libérer, d'où le `clearCache()`
  // systématique ; et son canvas de hit-test, lui, ignore `pixelRatio` — sans le sien
  // il serait alloué à la taille pleine de la source.
  useEffect(() => {
    const node = imageRef.current
    if (!node || !image) return
    node.clearCache()
    if (hasFilter) {
      node.cache({ pixelRatio: cachePixelRatio, hitCanvasPixelRatio: cachePixelRatio })
    }
    node.getLayer()?.batchDraw()
  }, [image, hasFilter, cachePixelRatio])

  useEffect(() => {
    if (!image) return
    onLayoutChange?.({ x: baseX, y: baseY, offsetX, offsetY, scaleX, scaleY: 1, rotation })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, baseX, baseY, offsetX, offsetY, scaleX, rotation])

  // Effet de layout, pas d'effet passif : la vue s'ajuste à partir de ces dimensions,
  // et le fait dans le même passage que le rendu qui les a produites.
  useLayoutEffect(() => {
    if (!image) return
    onSourceGeometryChange?.({ sourceWidth: image.width, sourceHeight: image.height })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image])

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
      draggable={isDraggable}
      onDragMove={(e) => setPosition({ x: e.target.x(), y: e.target.y() })}
      onDragEnd={(e) => setPosition({ x: e.target.x(), y: e.target.y() })}
      filters={konvaFilters}
      {...filterProps}
      {...transformProps}
    />
  )
}
