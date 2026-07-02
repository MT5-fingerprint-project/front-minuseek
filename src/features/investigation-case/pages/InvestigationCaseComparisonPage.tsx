import { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { ResizableHandle, ResizablePanelGroup } from '@/features/shared/ui/resizable'
import { useComparisonWindow } from '@/features/investigation-case/hooks/useComparisonWindow'
import ComparisonWindow from '@/features/investigation-case/components/comparison/ComparisonWindow'
import { useBiometricImages } from '@/features/biometric-image/hooks/useBiometricImages'
import { useCompare } from '@/features/biometric-image/hooks/useCompare'

export default function InvestigationCaseComparisonPage() {
  const { id } = useParams<{ id: string }>()
  const [activeWindow, setActiveWindow] = useState<'trace' | 'reference'>()
  const trace = useComparisonWindow()
  const reference = useComparisonWindow()

  const { data: referencePrints = [] } = useBiometricImages('reference-prints', id ?? '')
  const compare = useCompare()

  const runCompare = useCallback(() => {
    if (!trace.selected || referencePrints.length === 0 || !id) return
    compare.mutate({ caseId: id, trace: trace.selected, referencePrints })
  }, [trace.selected, referencePrints, id])

  if (!id) return null

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full min-h-[500px] gap-1.5">
      <ComparisonWindow
        side="left"
        type="traces"
        caseId={id}
        active={activeWindow === 'trace'}
        onActivate={() => setActiveWindow('trace')}
        window={trace}
        isComparing={compare.isPending}
        onAnalyze={runCompare}
      />
      <ResizableHandle withHandle />
      <ComparisonWindow
        side="right"
        type="reference-prints"
        caseId={id}
        active={activeWindow === 'reference'}
        onActivate={() => setActiveWindow('reference')}
        window={reference}
        selectedTraceId={trace.selected?.id}
      />
    </ResizablePanelGroup>
  )
}
