import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ResizableHandle, ResizablePanelGroup } from '@/features/shared/ui/resizable'
import { useComparisonWindow } from '@/features/investigation-case/hooks/useComparisonWindow'
import { useDetachedWindow } from '@/features/shared/hooks/useDetachedWindow'
import ComparisonWindow from '@/features/investigation-case/components/comparison/ComparisonWindow'
import { useBiometricImages } from '@/features/biometric-image/hooks/useBiometricImages'
import { useCompare } from '@/features/biometric-image/hooks/useCompare'

export default function InvestigationCaseComparisonPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>()
  const [activeWindow, setActiveWindow] = useState<'trace' | 'reference'>()
  const trace = useComparisonWindow()
  const reference = useComparisonWindow()
  const referenceWindow = useDetachedWindow('minuseek-reference-prints')

  const { data: referencePrints = [] } = useBiometricImages('reference-prints', id ?? '')
  const compare = useCompare()

  const runCompare = () => {
    if (!trace.selectedTrace || referencePrints.length === 0 || !id) return
    compare.mutate({ caseId: id, trace: trace.selectedTrace, referencePrints })
  }

  const detachReference = () => {
    if (!slug || !id) return
    referenceWindow.open(`${window.location.origin}/${slug}/affaires/${id}/comparaison/empreintes`)
  }

  if (!id) return null

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full min-h-[500px]">
      <ComparisonWindow
        side="left"
        type="traces"
        caseId={id}
        isActive={activeWindow === 'trace'}
        onActivate={() => setActiveWindow('trace')}
        window={trace}
        isComparing={compare.isPending}
        onAnalyze={runCompare}
      />
      {!referenceWindow.isOpen && (
        <>
          <ResizableHandle withHandle className="w-2 bg-transparent" />
          <ComparisonWindow
            side="right"
            type="reference-prints"
            caseId={id}
            isActive={activeWindow === 'reference'}
            onActivate={() => setActiveWindow('reference')}
            window={reference}
            selectedTraceId={trace.selectedTrace?.id}
            onToggleDetach={detachReference}
          />
        </>
      )}
    </ResizablePanelGroup>
  )
}
