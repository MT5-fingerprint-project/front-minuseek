import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLayers, useCreateLayer, useUpdateLayer } from './useLayers'
import { DEFAULT_FILTERS, FILTER_META, type CanvasFilters } from '../components/toolbar/canvasFilters'

export function useCanvasFilters(fingerprintId: string | undefined) {
  const { t } = useTranslation()
  const [sliderValues, setSliderValues] = useState<CanvasFilters>(DEFAULT_FILTERS)
  const prevValues = useRef<CanvasFilters>(DEFAULT_FILTERS)
  const layerIdByKey = useRef<Record<string, string>>({})
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const { data: layers = [] } = useLayers(fingerprintId)
  const createLayer = useCreateLayer(fingerprintId ?? '')
  const updateLayer = useUpdateLayer(fingerprintId ?? '')

  // Restore slider values and layer ids from persisted filter layers on load
  useEffect(() => {
    for (const layer of layers) {
      if (layer.type !== 'FILTER') continue
      const key = layer.settings.filterKey as string | undefined
      const value = layer.settings.value as number | undefined
      if (!key) continue
      layerIdByKey.current[key] = layer.id
      if (value !== undefined) {
        setSliderValues((prev) => ({ ...prev, [key]: value }))
        prevValues.current = { ...prevValues.current, [key]: value }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers.length])

  // Remove stale refs and reset sliders when a layer is deleted externally
  useEffect(() => {
    const liveIds = new Set(layers.map((l) => l.id))
    const deletedKeys: string[] = []
    for (const [key, id] of Object.entries(layerIdByKey.current)) {
      if (!liveIds.has(id)) {
        delete layerIdByKey.current[key]
        deletedKeys.push(key)
      }
    }
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

      if (existingId) {
        updateLayer.mutate({ id: existingId, input: { settings } })
      } else {
        const id = crypto.randomUUID()
        layerIdByKey.current[changedKey] = id
        createLayer.mutate({
          id,
          fingerprintId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          name: t(FILTER_META[changedKey]?.labelKey as any ?? changedKey),
          type: 'FILTER',
          zIndex: Object.keys(layerIdByKey.current).length,
          settings,
        })
      }
    }, 500)
  }

  // Only apply filters whose layer is visible (unmask = visible, mask = hidden)
  const effectiveFilters: CanvasFilters = Object.fromEntries(
    Object.entries(sliderValues).filter(([key, value]) => {
      if (value === 0) return false
      const layerId = layerIdByKey.current[key]
      if (!layerId) return true // not yet persisted, apply optimistically
      const layer = layers.find((l) => l.id === layerId)
      return !layer || layer.isVisible
    }),
  )

  return { sliderValues, effectiveFilters, handleFilterChange }
}
