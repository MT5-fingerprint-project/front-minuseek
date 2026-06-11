import { Icon, type IconName } from '@/features/shared/icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/shared/ui/tooltip'

type ItemToolbarProps = {
  icon: IconName
  label: string
  // active?: boolean
  // onClick?: () => void
}

export default function ItemToolbar({ icon, label }: ItemToolbarProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="rounded-sm p-1.5 hover:bg-white/15">
          <Icon name={icon} size={20} color="currentColor" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
