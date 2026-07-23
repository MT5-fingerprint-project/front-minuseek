import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { useClickOutside } from '@/features/shared/hooks/useClickOutside'
import { useAuth } from '@/features/shared/auth/auth-context'

/** En-tête de la page liste des affaires : logo + bouton compte (menu déconnexion). */
export default function CasesHeader() {
  const { t } = useTranslation()
  const { username, logout } = useAuth()
  const [isMenuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useClickOutside(menuRef, () => setMenuOpen(false), { enabled: isMenuOpen })

  const label = username ?? t('auth.account')

  return (
    <header className="flex items-center justify-between px-6 py-4 text-blue-dark-2">
      <span className="text-2xl font-light">MINUSEEK</span>
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
