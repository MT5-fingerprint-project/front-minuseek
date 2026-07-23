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
  return (
    <Link
      to={link}
      title={!isCollapsed ? label : undefined}
      className={cn(
        'flex items-center w-fit gap-2 py-1 rounded-sm transition-colors',
        isActive ? 'bg-blue-medium-2' : 'hover:bg-white/10', isCollapsed ? 'px-1' : 'px-2'
      )}
    >
      <Icon name={icon} size={24} color="white" />
      {!isCollapsed && label}
    </Link>
  )
}
