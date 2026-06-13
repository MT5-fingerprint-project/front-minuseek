import { Icon, type IconName } from '@/features/shared/icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/shared/ui/tooltip'
import { cn } from '@/features/shared/lib/utils'

type ItemToolbarProps = {
  icon: IconName
  label: string
  active?: boolean
  onClick?: () => void
}

export default function ItemToolbar({ icon, label, active = false, onClick }: ItemToolbarProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className={cn('rounded-sm p-1.5 hover:bg-white/15', active && 'bg-white/20')}
        >
          <Icon name={icon} size={20} color="currentColor" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
