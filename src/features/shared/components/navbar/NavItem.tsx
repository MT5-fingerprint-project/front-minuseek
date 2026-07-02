import { Link } from 'react-router-dom'
import { cn } from '@/features/shared/lib/utils'
import { Icon } from '@/features/shared/icons'
import type { IconName } from '@/features/shared/icons'

type NavItemProps = {
  link: string
  icon: IconName
  label: string
  isActive?: boolean
  isCollapsed?: boolean
}

export default function NavItem({ link, icon, label, isActive = false, isCollapsed = false }: NavItemProps) {
  if (isCollapsed) {
    return (
      <Link
        to={link}
        title={label}
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-md transition-colors',
          isActive ? 'bg-blue-medium-2' : 'hover:bg-white/10',
        )}
      >
        <Icon name={icon} size={20} color="white" />
      </Link>
    )
  }

  return (
    <Link
      to={link}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
        isActive ? 'bg-blue-medium-2 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white',
      )}
    >
      <Icon name={icon} size={18} color="white" />
      {label}
    </Link>
  )
}
