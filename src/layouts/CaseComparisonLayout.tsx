import { Outlet } from 'react-router-dom'
import { ComparisonTourProvider } from '@/features/investigation-case/context/ComparisonTourContext'
import { useComparisonTour } from '@/features/investigation-case/context/comparison-tour-context'
import CaseFrame from './CaseFrame'

function CaseComparisonFrame() {
  const { restartTour } = useComparisonTour()

  return (
    <CaseFrame navbarCollapsed activeNav="comparison" onRestartTour={restartTour ?? undefined}>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </CaseFrame>
  )
}

/** Layout plein cadre du comparateur : navbar réduite, pas de carte paddée. */
export default function CaseComparisonLayout() {
  return (
    <ComparisonTourProvider>
      <CaseComparisonFrame />
    </ComparisonTourProvider>
  )
}
