import { Link, useParams } from 'react-router-dom'
import { Icon } from '@/features/shared/icons'
import { useTranslation } from 'react-i18next'
import { CaseStatusBadge } from '@/features/investigation-case/components/CaseStatusBadge'
import NavItem from './NavItem'
import NavFooter from './NavFooter'
import type { ComponentProps } from 'react'
import type { InvestigationCase } from '@/features/investigation-case/types/investigationCase'

type NavItemConfig = ComponentProps<typeof NavItem>

type NavbarProps = {
  isCollapsed?: boolean
  investigationCase?: InvestigationCase
  items: NavItemConfig[]
  /** Icône de relance du tour guidé, affichée au-dessus du profil (mode comparateur seulement) */
  onRestartTour?: () => void
}

export default function Navbar({ isCollapsed = false, investigationCase, items, onRestartTour }: NavbarProps) {
  const { t } = useTranslation()
  const { slug } = useParams<{ slug: string }>()

  if (isCollapsed) {
    return (
      <aside className="flex flex-col items-center justify-between bg-blue-dark-1 text-white w-14 py-4 shrink-0">
        <div className="flex flex-col gap-8">
          <div className="px-3">
            <Link
              to={`/${slug}/affaires`}
              className="flex items-center justify-center p-1 hover:bg-white/10 rounded-md transition-colors"
              title={t('navigation.backToCases')}
            >
              <Icon name="home" size={24} color="blue-light-1" />
            </Link>
          </div>
          <div className="w-full border-t border-blue-light-1" />
          <nav className="flex flex-col gap-3 px-3">
            {items.map((item) => (
              <NavItem key={item.link} {...item} isCollapsed />
            ))}
          </nav>
        </div>
        <NavFooter isCollapsed onRestartTour={onRestartTour} />
      </aside >
    )
  }

  return (
    <aside className="flex flex-col bg-blue-dark-1 justify-between text-white w-64 shrink-0 py-4">
      <div className="flex flex-col gap-8">
        <span className="text-2xl px-4 font-light">MINUSEEK</span>
        <div className="px-4 flex flex-col gap-5 items-start">
          <Link
            to={`/${slug}/affaires`}
            className="flex items-center gap-2 text-blue-light-1 font-light hover:text-white underline transition-colors"
          >
            <Icon name="home" size={20} color="white" />
            {t('navigation.backToCases')}
          </Link>
          {investigationCase && (
            <>
              <CaseStatusBadge status={investigationCase.status} />
              <div className="flex flex-col gap-1">
                <p className="font-bold text-2xl">Affaire n°{investigationCase.caseNumber}</p>
                <p className="text-blue-light-1 font-light">PV n°{investigationCase.pvNumber}</p>
              </div>
            </>
          )}
        </div>
        <div className="border-t border-blue-light-1" />
        <nav className="flex flex-col px-3 gap-3">
          {items.map((item) => (
            <NavItem key={item.link} {...item} />
          ))}
        </nav>
      </div>
      <NavFooter onRestartTour={onRestartTour} />
    </aside>
  )
}
