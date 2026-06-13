import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '@/features/shared/icons'
import { cn } from '@/features/shared/lib/utils'

type WindowFooterProps = {
  collapseDirection: 'left' | 'right'
  onToggleCollapse: () => void
  footer?: ReactNode
}

export default function WindowFooter({ collapseDirection, onToggleCollapse, footer }: WindowFooterProps) {
  const { t } = useTranslation()
  const collapseIcon: IconName = collapseDirection === 'left' ? 'chevronLeft' : 'chevronRight'

  return (
    <div
      className={cn(
        'flex items-center justify-between border-t px-3 py-1.5',
        collapseDirection === 'right' && 'flex-row-reverse',
      )}
    >
      <button
        type="button"
        onClick={onToggleCollapse}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        {collapseDirection === 'left' && <Icon name={collapseIcon} size={24} color="currentColor" />}
        {t('common.window.reduce')}
        {collapseDirection === 'right' && <Icon name={collapseIcon} size={24} color="currentColor" />}
      </button>
      {footer}
    </div>
  )
}
