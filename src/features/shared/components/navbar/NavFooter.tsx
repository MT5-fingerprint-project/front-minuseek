import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CircleHelp } from 'lucide-react'
import { Icon } from '@/features/shared/icons'
import { cn } from '@/features/shared/lib/utils'
import { useClickOutside } from '@/features/shared/hooks/useClickOutside'
import { useAuth } from '@/features/shared/auth/auth-context'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/shared/ui/tooltip'

type NavFooterProps = {
  isCollapsed?: boolean
  /** Affiche l'icône de relance du tour guidé au-dessus du profil (mode comparateur seulement) */
  onRestartTour?: () => void
}

/** Pied de navbar : bouton compte ouvrant un mini-menu (déconnexion, + d'actions à venir). */
export default function NavFooter({ isCollapsed = false, onRestartTour }: NavFooterProps) {
  const { t } = useTranslation()
  const { username, logout } = useAuth()
  const [isMenuOpen, setMenuOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  useClickOutside(containerRef, () => setMenuOpen(false), { enabled: isMenuOpen })

  const label = username ?? t('auth.account')

  return (
    <div ref={containerRef} className="relative flex flex-col items-start gap-1 px-4">
      {onRestartTour && (
        <Tooltip>
          <TooltipTrigger
            type="button"
            onClick={onRestartTour}
            aria-label={t('investigationCase.comparison.tour.restartLabel')}
            className="flex items-center gap-2 rounded-md p-2 text-grey-light-2 transition-colors hover:bg-white/10"
          >
            <CircleHelp size={24} />
          </TooltipTrigger>
          <TooltipContent side="right">{t('investigationCase.comparison.tour.restartLabel')}</TooltipContent>
        </Tooltip>
      )}
      {isMenuOpen && (
        <div
          role="menu"
          className="absolute bottom-full left-4 mb-2 min-w-44 overflow-hidden rounded-sm bg-white text-blue-dark-2 shadow-lg"
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
      {(() => {
        const accountButton = (
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            title={!isCollapsed ? label : undefined}
            aria-label={label}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            className={cn(
              'flex items-center gap-2 rounded-md p-2 text-grey-light-2 transition-colors hover:bg-white/10',
              !isCollapsed && 'text-sm',
            )}
          >
            <Icon name="personProfile" size={24} color="grey-light-2" />
            {!isCollapsed && <span className="capitalize">{label}</span>}
          </button>
        )

        if (!isCollapsed) return accountButton

        return (
          <Tooltip>
            <TooltipTrigger asChild>{accountButton}</TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        )
      })()}
    </div>
  )
}
