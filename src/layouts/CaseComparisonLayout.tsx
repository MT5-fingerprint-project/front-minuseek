import { Outlet } from 'react-router-dom'
import CaseFrame from './CaseFrame'

/** Layout plein cadre du comparateur : navbar réduite, pas de carte paddée. */
export default function CaseComparisonLayout() {
  return (
    <CaseFrame navbarCollapsed activeNav="comparison">
      <div className="flex-1">
        <Outlet />
      </div>
    </CaseFrame>
  )
}
