import { Outlet } from 'react-router-dom'
import CaseFrame from './CaseFrame'

type CasePageLayoutProps = {
  /** Entrée de navigation active (pages internes hors comparateur) */
  activeNav?: 'info' | 'subjects'
}

/**
 * Layout des pages « internes à une affaire » (infos, sujets…) :
 * carte grise paddée. Le padding vit ici, pas dans le cadre parent.
 */
export default function CasePageLayout({ activeNav = 'info' }: CasePageLayoutProps) {
  return (
    <CaseFrame activeNav={activeNav}>
      <div className="flex-1 rounded-md bg-grey-light-1 px-25 py-16">
        <Outlet />
      </div>
    </CaseFrame>
  )
}
