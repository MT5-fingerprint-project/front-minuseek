import { useEffect, useRef, useState } from 'react'
import type { ParseKeys } from 'i18next'
import { useTranslation } from 'react-i18next'
import { useLayers, useCreateLayer, useUpdateLayer, useDeleteLayer } from './useLayers'
import type { LayerHistoryEntry } from './useLayerHistory'
import { DEFAULT_FILTERS, FILTER_META, type CanvasFilters } from '../components/toolbar/canvasFilters'
import {
  DEFAULT_CURVE_POINTS,
  isIdentityCurve,
  sortedCurvePoints,
  type CurvePoint,
} from '../lib/toneCurve'

const CURVE_KEY = 'curve'

function readCurvePoints(settings: Record<string, unknown>): CurvePoint[] | null {
  const points = settings.points
  if (!Array.isArray(points) || points.length < 2) return null
  const read = points.filter(
    (point): point is CurvePoint =>
      typeof point === 'object' &&
      point !== null &&
      typeof (point as CurvePoint).x === 'number' &&
      typeof (point as CurvePoint).y === 'number',
  )
  return read.length === points.length ? sortedCurvePoints(read) : null
}

export function useCanvasFilters(
  fingerprintId: string | undefined,
  onRecordHistory?: (entry: LayerHistoryEntry) => void,
) {
  const { t } = useTranslation()
  const [sliderValues, setSliderValues] = useState<CanvasFilters>(DEFAULT_FILTERS)
  const [curvePoints, setCurvePoints] = useState<CurvePoint[]>(DEFAULT_CURVE_POINTS)
  const prevValues = useRef<CanvasFilters>(DEFAULT_FILTERS)
  const layerIdByKey = useRef<Record<string, string>>({})
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const { data: layers = [] } = useLayers(fingerprintId)
  const createLayer = useCreateLayer()
  const updateLayer = useUpdateLayer()
  const deleteLayer = useDeleteLayer()


  const persistedFilterIds = layers
    .filter((layer) => layer.type === 'FILTER')
    .map((layer) => layer.id)
    .join('|')

  useEffect(() => {
    for (const layer of layers) {
      if (layer.type !== 'FILTER') continue
      const key = layer.settings.filterKey as string | undefined
      const value = layer.settings.value as number | undefined
      if (!key) continue
      layerIdByKey.current[key] = layer.id
      if (key === CURVE_KEY) {
        const points = readCurvePoints(layer.settings)
        if (points) setCurvePoints(points)
        continue
      }
      if (value !== undefined) {
        setSliderValues((prev) => ({ ...prev, [key]: value }))
        prevValues.current = { ...prevValues.current, [key]: value }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistedFilterIds])


  useEffect(() => {
    const liveIds = new Set(layers.map((l) => l.id))
    const deletedKeys: string[] = []
    for (const [key, id] of Object.entries(layerIdByKey.current)) {
      if (!liveIds.has(id)) {
        delete layerIdByKey.current[key]
        deletedKeys.push(key)
      }
    }
    if (deletedKeys.includes(CURVE_KEY)) setCurvePoints(DEFAULT_CURVE_POINTS)
    if (deletedKeys.length > 0) {
      setSliderValues((prev) => {
        const next = { ...prev }
        for (const key of deletedKeys) {
          delete next[key]
          delete prevValues.current[key]
        }
        return next
      })
    }
  }, [layers])

  const handleFilterChange = (newFilters: CanvasFilters) => {
    setSliderValues(newFilters)

    const changedKey = Object.keys(newFilters).find(
      (k) => newFilters[k] !== prevValues.current[k],
    )
    prevValues.current = newFilters

    if (!changedKey || !fingerprintId) return

    clearTimeout(debounceTimers.current[changedKey])
    debounceTimers.current[changedKey] = setTimeout(() => {
      const value = newFilters[changedKey]
      const settings = { filterKey: changedKey, value }
      const existingId = layerIdByKey.current[changedKey]
      const existingLayer = existingId ? layers.find((l) => l.id === existingId) : undefined

      if (value === 0) {
        if (existingId) {
          delete layerIdByKey.current[changedKey]
          deleteLayer.mutate(existingId)
          if (existingLayer) onRecordHistory?.({ kind: 'delete', layer: existingLayer })
        }
        return
      }

      if (existingId) {
        updateLayer.mutate({ id: existingId, input: { settings } })
        if (existingLayer) {
          onRecordHistory?.({ kind: 'update', id: existingId, before: existingLayer.settings, after: settings })
        }
      } else {
        const id = crypto.randomUUID()
        layerIdByKey.current[changedKey] = id
        const input = {
          id,
          fingerprintId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          name: t(FILTER_META[changedKey]?.labelKey as any ?? changedKey),
          type: 'FILTER' as const,
          zIndex: layers.length,
          settings,
        }
        createLayer.mutate(input)
        onRecordHistory?.({ kind: 'create', input })
      }
    }, 500)
  }

  // Un réglage pas encore enregistré n'a pas de calque : il s'applique quand même.
  const isLayerVisible = (key: string) => {
    const layer = layers.find((l) => l.type === 'FILTER' && l.settings.filterKey === key)
    return !layer || layer.isVisible
  }

  // La courbe se règle en relâchant une poignée, pas en glissant un curseur :
  // elle n'a pas besoin du délai qui protège les filtres à curseur.
  const handleCurveChange = (points: CurvePoint[]) => {
    setCurvePoints(points)
    if (!fingerprintId) return

    const existingId = layerIdByKey.current[CURVE_KEY]
    const existingLayer = existingId ? layers.find((l) => l.id === existingId) : undefined
    if (isIdentityCurve(points)) {
      if (existingId) {
        delete layerIdByKey.current[CURVE_KEY]
        deleteLayer.mutate(existingId)
        if (existingLayer) onRecordHistory?.({ kind: 'delete', layer: existingLayer })
      }
      return
    }

    const settings = { filterKey: CURVE_KEY, points }
    if (existingId) {
      updateLayer.mutate({ id: existingId, input: { settings } })
      if (existingLayer) {
        onRecordHistory?.({ kind: 'update', id: existingId, before: existingLayer.settings, after: settings })
      }
      return
    }
    const id = crypto.randomUUID()
    layerIdByKey.current[CURVE_KEY] = id
    const input = {
      id,
      fingerprintId,
      name: t(FILTER_META[CURVE_KEY].labelKey as ParseKeys),
      type: 'FILTER' as const,
      zIndex: layers.length,
      settings,
    }
    createLayer.mutate(input)
    onRecordHistory?.({ kind: 'create', input })
  }

  // Only apply filters whose layer is visible (unmask = visible, mask = hidden)
  const effectiveFilters: CanvasFilters = Object.fromEntries(
    Object.entries(sliderValues).filter(([key, value]) => value !== 0 && isLayerVisible(key)),
  )

  const effectiveCurvePoints = isLayerVisible(CURVE_KEY) ? curvePoints : DEFAULT_CURVE_POINTS

  return {
    sliderValues,
    effectiveFilters,
    handleFilterChange,
    curvePoints,
    effectiveCurvePoints,
    handleCurveChange,
  }
}
