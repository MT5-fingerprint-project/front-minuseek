import { Outlet } from 'react-router-dom'
import CaseFrame from './CaseFrame'

/**
 * Layout des pages « internes à une affaire » (infos + futures pages) :
 * carte grise paddée. Le padding vit ici, pas dans le cadre parent.
 */
export default function CasePageLayout() {
  return (
    <CaseFrame activeNav="info">
      <div className="flex-1 rounded-md bg-grey-light-1 px-25 py-16">
        <Outlet />
      </div>
    </CaseFrame>
  )
}
