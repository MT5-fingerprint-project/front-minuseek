import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ResizableHandle, ResizablePanelGroup } from '@/features/shared/ui/resizable'
import { useComparisonWindow } from '@/features/investigation-case/hooks/useComparisonWindow'
import ComparisonWindow from '@/features/investigation-case/components/comparison/ComparisonWindow'
import HitButton from '@/features/investigation-case/components/comparison/HitButton'
import { useBiometricImages } from '@/features/biometric-image/hooks/useBiometricImages'
import { useCompare } from '@/features/biometric-image/hooks/useCompare'
import { useLayers } from '@/features/biometric-image/hooks/useLayers'
import { useHits, useToggleHit } from '@/features/biometric-image/hooks/useHits'
import { countMinutiae, REQUIRED_MINUTIAE } from '@/features/biometric-image/lib/minutiae'

export default function InvestigationCaseComparisonPage() {
  const { id } = useParams<{ id: string }>()
  const [activeWindow, setActiveWindow] = useState<'trace' | 'reference'>()
  const trace = useComparisonWindow()
  const reference = useComparisonWindow()

  const { data: referencePrints = [] } = useBiometricImages('reference-prints', id ?? '')
  const compare = useCompare()

  const traceId = trace.selectedTrace?.id
  const referenceId = reference.selectedTrace?.id

  const { data: traceLayers } = useLayers(traceId)
  const { data: referenceLayers } = useLayers(referenceId)
  const { data: hitReferenceIds } = useHits(traceId)
  const toggleHit = useToggleHit(traceId)

  const isHit = !!referenceId && (hitReferenceIds?.includes(referenceId) ?? false)
  const hasEnoughMinutiae =
    countMinutiae(traceLayers) >= REQUIRED_MINUTIAE &&
    countMinutiae(referenceLayers) >= REQUIRED_MINUTIAE
  const isHitDisabled = !traceId || !referenceId || !hasEnoughMinutiae || toggleHit.isPending

  const runCompare = () => {
    if (!trace.selectedTrace || referencePrints.length === 0 || !id) return
    compare.mutate({ caseId: id, trace: trace.selectedTrace, referencePrints })
  }

  const onToggleHit = () => {
    if (!id || !referenceId) return
    toggleHit.mutate({ caseId: id, referencePrintId: referenceId, isHit })
  }

  if (!id) return null

  return (
    <div className="relative h-full">
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
        <ResizableHandle withHandle className="w-2 bg-transparent" />
        <ComparisonWindow
          side="right"
          type="reference-prints"
          caseId={id}
          isActive={activeWindow === 'reference'}
          onActivate={() => setActiveWindow('reference')}
          window={reference}
          selectedTraceId={trace.selectedTrace?.id}
        />
      </ResizablePanelGroup>
      <div className="pointer-events-none absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center">
        <div className="pointer-events-auto">
          <HitButton isHit={isHit} disabled={isHitDisabled} onClick={onToggleHit} />
        </div>
      </div>
    </div>
  )
}
