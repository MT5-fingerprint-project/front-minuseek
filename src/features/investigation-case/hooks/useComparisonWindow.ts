import { useRef, useState } from 'react'
import { usePanelRef } from 'react-resizable-panels'
import type {
  CanvasZoomHandle,
  ConcordanceHandle,
  ExportHandle,
} from '@/features/biometric-image/components/canvas/BiometricImageCanvas'
import type { SourceGeometry } from '@/features/biometric-image/components/canvas/DraggableImage'
import type { BiometricImage } from '@/features/biometric-image/types/biometricImage'

export type ComparisonWindowState = ReturnType<typeof useComparisonWindow>

export function useComparisonWindow() {
  const panelRef = usePanelRef()
  const zoomRef = useRef<CanvasZoomHandle>(null)
  const exportRef = useRef<ExportHandle>(null)
  const concordanceRef = useRef<ConcordanceHandle>(null)

  const [isCollapsed, setCollapsed] = useState(false)
  const [isFilesVisible, setFilesVisible] = useState(true)
  const [isLayersVisible, setLayersVisible] = useState(false)
  const [isGridVisible, setGridVisible] = useState(false)
  const [scale, setScale] = useState(1)
  const [selectedTrace, setSelectedTrace] = useState<BiometricImage>()
  const [sourceGeometry, setSourceGeometry] = useState<SourceGeometry | null>(null)

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
    exportRef,
    concordanceRef,
    isCollapsed,
    syncCollapsed,
    isFilesVisible,
    toggleFiles: () => setFilesVisible((v) => !v),
    isLayersVisible,
    toggleLayers: () => setLayersVisible((v) => !v),
    closeLayersPanel: () => setLayersVisible(false),
    isGridVisible,
    toggleGrid: () => setGridVisible((v) => !v),
    scale,
    handleScaleChange: setScale,
    sourceGeometry,
    setSourceGeometry,
    selectedTrace,
    setSelectedTrace,
    toggle,
  }
}
