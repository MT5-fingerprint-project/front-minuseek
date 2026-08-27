import { useTranslation } from 'react-i18next'
import { cn } from '@/features/shared/lib/utils'
import type { ServiceUserStatus } from '@/features/users/types/serviceUser'

const styles: Record<ServiceUserStatus, string> = {
  ACTIVE: 'bg-green-light text-green-medium border-green-medium',
  DISABLED: 'bg-grey-light-1 text-grey-medium-2 border-grey-medium-1',
}

export default function ServiceUserStatusBadge({ status }: { status: ServiceUserStatus }) {
  const { t } = useTranslation()

  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-full border px-3 py-1 text-sm font-medium leading-[16px]',
        styles[status]
      )}
    >
      {t(`users.status.${status}`)}
    </span>
  )
}
