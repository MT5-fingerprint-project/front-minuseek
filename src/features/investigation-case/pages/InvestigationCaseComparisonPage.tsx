import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ResizableHandle, ResizablePanelGroup } from '@/features/shared/ui/resizable'
import { useComparisonWindow } from '@/features/investigation-case/hooks/useComparisonWindow'
import ComparisonWindow from '@/features/investigation-case/components/comparison/ComparisonWindow'

export default function InvestigationCaseComparisonPage() {
  const { id } = useParams<{ id: string }>()
  const [activeWindow, setActiveWindow] = useState<'trace' | 'reference'>()
  const trace = useComparisonWindow()
  const reference = useComparisonWindow()

  if (!id) return null

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full min-h-[500px] gap-1.5">
      <ComparisonWindow
        side="left"
        type="traces"
        caseId={id}
        isActive={activeWindow === 'trace'}
        onActivate={() => setActiveWindow('trace')}
        window={trace}
      />
      <ResizableHandle withHandle />
      <ComparisonWindow
        side="right"
        type="reference-prints"
        caseId={id}
        isActive={activeWindow === 'reference'}
        onActivate={() => setActiveWindow('reference')}
        window={reference}
      />
    </ResizablePanelGroup>
  )
}
