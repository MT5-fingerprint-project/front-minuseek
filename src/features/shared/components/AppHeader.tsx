import { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { useClickOutside } from '@/features/shared/hooks/useClickOutside'
import { useCurrentUser } from '@/features/shared/hooks/useCurrentUser'
import { useMyVerifications } from '@/features/shared/hooks/useMyVerifications'
import { isInProgress } from '@/features/shared/types/verification'
import { useAuth } from '@/features/shared/auth/auth-context'
import { cn } from '@/features/shared/lib/utils'

const CASES_NAV = [{ path: 'affaires', icon: 'folder', labelKey: 'navigation.cases' }] as const

const MANAGER_NAV = [
  { path: 'utilisateurs', icon: 'personGroup', labelKey: 'navigation.users' },
  { path: 'parametres', icon: 'settings', labelKey: 'navigation.settings' },
] as const

const PEER_REVIEW_NAV = {
  path: 'dossier-pair',
  icon: 'folder',
  labelKey: 'navigation.peerReviewCases',
} as const

export default function AppHeader() {
  const { t } = useTranslation()
  const { slug, username, logout } = useAuth()
  const { pathname } = useLocation()
  const { data: currentUser } = useCurrentUser()
  const { data: missions = [] } = useMyVerifications()
  const [isMenuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useClickOutside(menuRef, () => setMenuOpen(false), { enabled: isMenuOpen })

  const label = username ?? t('auth.account')
  const isServiceManager = currentUser?.role === 'ADMIN'
  const entries = [
    ...CASES_NAV,
    ...(missions.some(isInProgress) ? [PEER_REVIEW_NAV] : []),
    ...(isServiceManager ? MANAGER_NAV : []),
  ]

  const serviceHomePath = `/${slug}`
  const isOnServiceHome = pathname === serviceHomePath

  function isCurrentSection(path: string): boolean {
    const sectionPath = `${serviceHomePath}/${path}`
    return pathname === sectionPath || pathname.startsWith(`${sectionPath}/`)
  }

  return (
    <header className="flex items-center justify-between gap-6 px-6 py-4 text-blue-dark-2">
      <div className="flex items-center gap-10">
        <Link
          to={serviceHomePath}
          aria-label={t('navigation.backToHome')}
          className="text-2xl font-light transition-colors hover:text-blue-medium-1"
        >
          MINUSEEK
        </Link>

        {entries.length > 0 && (
          <nav aria-label={t('navigation.serviceNavigation')} className="flex items-center gap-1">
            <Link
              to={serviceHomePath}
              aria-current={isOnServiceHome ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors',
                isOnServiceHome ? 'bg-blue-light-1 font-medium' : 'hover:bg-grey-light-1'
              )}
            >
              <Icon name="home" size={18} color="currentColor" />
              {t('navigation.home')}
            </Link>
            {entries.map((entry) => {
              const isCurrent = isCurrentSection(entry.path)
              return (
                <Link
                  key={entry.path}
                  to={`/${slug}/${entry.path}`}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors',
                    isCurrent ? 'bg-blue-light-1 font-medium' : 'hover:bg-grey-light-1'
                  )}
                >
                  <Icon name={entry.icon} size={18} color="currentColor" />
                  {t(entry.labelKey)}
                </Link>
              )
            })}
          </nav>
        )}
      </div>

      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          className="flex items-center gap-2 rounded-full text-md py-1 pl-3 pr-1 transition-colors hover:bg-grey-light-1"
        >
          <span className="capitalize">{label}</span>
          <Icon name="personProfile" size={32} color="currentColor" />
        </button>
        {isMenuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full z-10 mt-2 min-w-44 overflow-hidden rounded-sm bg-white text-blue-dark-2 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false)
                logout()
              }}
              className="flex w-full items-center gap-1.5 px-3 py-2 text-sm hover:bg-grey-light-1"
            >
              <Icon name="logout" size={20} color="currentColor" />
              {t('auth.logout')}
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
