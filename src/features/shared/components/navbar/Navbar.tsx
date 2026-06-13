import { Link } from 'react-router-dom'
import { Icon } from '@/features/shared/icons'
import { useTranslation } from 'react-i18next'
import { CaseStatusBadge } from '@/features/investigation-case/components/CaseStatusBadge'
import NavItem from './NavItem'
import type { ComponentProps } from 'react'
import type { InvestigationCase } from '@/features/investigation-case/types/investigationCase'

type NavItemConfig = ComponentProps<typeof NavItem>

type NavbarProps = {
  collapsed?: boolean
  investigationCase?: InvestigationCase
  items: NavItemConfig[]
}

export default function Navbar({ collapsed = false, investigationCase, items }: NavbarProps) {
  const { t } = useTranslation()

  if (collapsed) {
    return (
      <aside className="flex flex-col items-center gap-4 bg-blue-dark-1 text-white w-14 py-4 shrink-0">
        <Link
          to="/affaires"
          className="flex items-center justify-center w-9 h-9 hover:bg-white/10 rounded-md transition-colors"
          title={t('navigation.backToCases')}
        >
          <Icon name="home" size={20} color="white" />
        </Link>
        <div className="w-full border-t border-white/20" />
        {items.map((item) => (
          <NavItem key={item.link} {...item} collapsed />
        ))}
      </aside>
    )
  }

  return (
    <aside className="flex flex-col bg-blue-dark-1 text-white w-64 shrink-0 py-4">
      <div className="px-4 pb-4">
        <span className="text-xl font-bold tracking-wide">MINUSEEK</span>
      </div>
      <div className="px-4 flex flex-col gap-3 pb-4 items-start">
        <Link
          to="/affaires"
          className="flex items-center gap-2 text-sm text-white/80 hover:text-white underline transition-colors"
        >
          <Icon name="home" size={16} color="white" />
          {t('navigation.backToCases')}
        </Link>
        {investigationCase && (
          <>
            <CaseStatusBadge status={investigationCase.status} />
            <div>
              <p className="font-bold text-lg leading-tight">Affaire n°{investigationCase.caseNumber}</p>
              <p className="text-sm text-white/60">PV n°{investigationCase.pvNumber}</p>
            </div>
          </>
        )}
      </div>
      <div className="border-t border-white/20 mb-4" />
      <nav className="flex flex-col px-2 gap-1">
        {items.map((item) => (
          <NavItem key={item.link} {...item} />
        ))}
      </nav>
    </aside>
  )
}
