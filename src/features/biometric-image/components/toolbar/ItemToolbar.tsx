import { Icon, type IconName } from '@/features/shared/icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/shared/ui/tooltip'
import { cn } from '@/features/shared/lib/utils'

type ItemToolbarProps = {
  icon: IconName
  label: string
  active?: boolean
  disabled?: boolean
  onClick?: () => void
}

export default function ItemToolbar({ icon, label, active = false, disabled = false, onClick }: ItemToolbarProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-disabled={disabled}
          onClick={disabled ? undefined : onClick}
          className={cn(
            'rounded-sm p-1.5',
            disabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-white/15',
            active && !disabled && 'bg-white/20'
          )}
        >
          <Icon name={icon} size={20} color="currentColor" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
