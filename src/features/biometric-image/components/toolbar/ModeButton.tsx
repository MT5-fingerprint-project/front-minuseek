import { Icon, type IconName } from '@/features/shared/icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/shared/ui/tooltip'
import { cn } from '@/features/shared/lib/utils'

type ModeButtonProps = {
  icon: IconName
  label: string
  isActive: boolean
  onClick: () => void
}

export default function ModeButton({ icon, label, isActive, onClick }: ModeButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className={cn('rounded-sm p-1.5 hover:bg-white/15', isActive && 'bg-blue-dark-1')}
        >
          <Icon name={icon} size={20} color="currentColor" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
