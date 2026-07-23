import { Icon, type IconName } from '@/features/shared/icons'
import { cn } from '@/features/shared/lib/utils'

type WindowActionButtonProps = {
  icon: IconName
  label: string
  onClick?: () => void
  /** 'title' = barre de titre bleue (défaut), 'footer' = pied blanc */
  tone?: 'title' | 'footer'
}

const TONES = {
  title: { className: 'rounded p-1 hover:bg-white/15' },
  footer: { className: 'rounded p-0.5 text-muted-foreground hover:text-foreground' },
} as const

export default function WindowActionButton({ icon, label, onClick, tone = 'title' }: WindowActionButtonProps) {
  const { className } = TONES[tone]
  return (
    <button type="button" onClick={onClick} title={label} className={cn(className)}>
      <Icon name={icon} size={24} color="currentColor" />
    </button>
  )
}
