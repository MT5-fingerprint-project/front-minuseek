import { useRef, useState } from 'react'
import { usePanelRef } from 'react-resizable-panels'
import type { CanvasZoomHandle } from '@/features/biometric-image/components/canvas/BiometricImageCanvas'
import type { BiometricImage } from '@/features/biometric-image/types/biometricImage'

export type ComparisonWindowState = ReturnType<typeof useComparisonWindow>

export function useComparisonWindow() {
  const panelRef = usePanelRef()
  const zoomRef = useRef<CanvasZoomHandle>(null)

  const [isCollapsed, setCollapsed] = useState(false)
  const [isFilesVisible, setFilesVisible] = useState(true)
  const [isLayersVisible, setLayersVisible] = useState(false)
  const [scale, setScale] = useState(1)
  const [selectedTrace, setSelectedTrace] = useState<BiometricImage>()

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
    isCollapsed,
    syncCollapsed,
    isFilesVisible,
    toggleFiles: () => setFilesVisible((v) => !v),
    isLayersVisible,
    toggleLayers: () => setLayersVisible((v) => !v),
    closeLayersPanel: () => setLayersVisible(false),
    scale,
    setScale,
    selectedTrace,
    setSelectedTrace,
    toggle,
  }
}
