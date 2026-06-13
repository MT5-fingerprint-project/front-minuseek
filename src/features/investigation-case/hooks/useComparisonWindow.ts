import { useRef, useState } from 'react'
import { usePanelRef } from 'react-resizable-panels'
import type { CanvasZoomHandle } from '@/features/biometric-image/components/canvas/BiometricImageCanvas'
import type { BiometricImage } from '@/features/biometric-image/types/biometricImage'

export type ComparisonWindowState = ReturnType<typeof useComparisonWindow>

export function useComparisonWindow() {
  const panelRef = usePanelRef()
  const zoomRef = useRef<CanvasZoomHandle>(null)

  const [collapsed, setCollapsed] = useState(false)
  const [filesVisible, setFilesVisible] = useState(true)
  const [layersVisible, setLayersVisible] = useState(false)
  const [scale, setScale] = useState(1)
  const [selected, setSelected] = useState<BiometricImage>()

  const toggle = () => {
    const panel = panelRef.current
    if (!panel) return
    if (panel.isCollapsed()) panel.expand()
    else panel.collapse()
  }

  const syncCollapsed = () => setCollapsed(panelRef.current?.isCollapsed() ?? false)

  return {
    panelRef,
    zoomRef,
    collapsed,
    syncCollapsed,
    filesVisible,
    toggleFiles: () => setFilesVisible((v) => !v),
    layersVisible,
    toggleLayers: () => setLayersVisible((v) => !v),
    closeLayersPanel: () => setLayersVisible(false),
    scale,
    setScale,
    selected,
    setSelected,
    toggle,
  }
}
