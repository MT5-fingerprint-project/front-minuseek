import { Icon, type IconName } from '@/features/shared/icons'

type WindowActionButtonProps = {
  icon: IconName
  label: string
  onClick?: () => void
}

export default function WindowActionButton({ icon, label, onClick }: WindowActionButtonProps) {
  return (
    <button type="button" onClick={onClick} title={label} className="rounded p-1 hover:bg-white/15">
      <Icon name={icon} size={24} color="currentColor" />
    </button>
  )
}
