import { EllipsisVertical, Pencil, UserCheck, UserX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { buttonVariants } from '@/features/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/features/shared/ui/dropdown-menu'
import { cn } from '@/features/shared/lib/utils'
import ServiceUserStatusBadge from '@/features/users/components/ServiceUserStatusBadge'
import type { ServiceUser } from '@/features/users/types/serviceUser'

type ServiceUsersTableProps = {
  users: ServiceUser[]
  currentUserId: string | undefined
  pendingUserId: string | null
  emptyMessage: string
  onEdit: (user: ServiceUser) => void
  onDeactivate: (user: ServiceUser) => void
  onReactivate: (user: ServiceUser) => void
}

export default function ServiceUsersTable({
  users,
  currentUserId,
  pendingUserId,
  emptyMessage,
  onEdit,
  onDeactivate,
  onReactivate,
}: ServiceUsersTableProps) {
  const { t } = useTranslation()

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[880px] text-left text-sm text-blue-dark-2">
        <thead className="text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              {t('users.table.lastName')}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {t('users.table.firstName')}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {t('users.table.role')}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {t('users.table.grade')}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {t('users.table.serviceNumber')}
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              {t('users.table.status')}
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              <span className="sr-only">{t('users.table.actions')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            users.map((user) => {
              const isDisabled = user.status === 'DISABLED'
              const isCurrentUser = user.id === currentUserId
              const fullName = `${user.firstName} ${user.lastName}`

              return (
                <tr
                  key={user.id}
                  className={cn(
                    'group border-t border-grey-light-2 transition-colors hover:bg-blue-light-1',
                    isDisabled && 'text-grey-medium-2'
                  )}
                >
                  <td className="px-4 py-3 font-semibold">
                    <span className={cn(isDisabled && 'line-through')}>{user.lastName}</span>
                    {isCurrentUser && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">{t('users.list.you')}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{user.firstName}</td>
                  <td className="px-4 py-3">{t(`users.roles.${user.role}`)}</td>
                  <td className="px-4 py-3">{user.grade}</td>
                  <td className="px-4 py-3">{user.serviceNumber}</td>
                  <td className="px-4 py-3">
                    <ServiceUserStatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        disabled={user.id === pendingUserId}
                        aria-label={t('users.actions.menu', { name: fullName })}
                        className={cn(
                          buttonVariants({ variant: 'greySecondary', size: 'small' }),
                          'size-8 rounded-full p-0 opacity-0 transition-opacity',
                          'group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100'
                        )}
                      >
                        <EllipsisVertical className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => onEdit(user)}>
                          <Pencil className="size-4" />
                          {t('users.actions.edit')}
                        </DropdownMenuItem>
                        {isDisabled ? (
                          <DropdownMenuItem onSelect={() => onReactivate(user)}>
                            <UserCheck className="size-4" />
                            {t('users.actions.reactivate')}
                          </DropdownMenuItem>
                        ) : (
                          !isCurrentUser && (
                            <DropdownMenuItem variant="destructive" onSelect={() => onDeactivate(user)}>
                              <UserX className="size-4" />
                              {t('users.actions.deactivate')}
                            </DropdownMenuItem>
                          )
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
