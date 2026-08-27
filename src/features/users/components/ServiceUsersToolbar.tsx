import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { Input } from '@/features/shared/ui/input'
import { Spinner } from '@/features/shared/ui/spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/ui/select'
import { SELECTABLE_USER_ROLES, type UserRole } from '@/features/shared/types/user'
import {
  SERVICE_USER_STATUSES,
  type ServiceUsersFilters,
  type ServiceUserStatus,
} from '@/features/users/types/serviceUser'

const ANY = 'ANY'

type ServiceUsersToolbarProps = {
  filters: ServiceUsersFilters
  grades: string[]
  isSearching: boolean
  onChange: (filters: ServiceUsersFilters) => void
}

export default function ServiceUsersToolbar({ filters, grades, isSearching, onChange }: ServiceUsersToolbarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-64 flex-1 sm:max-w-sm">
        <Icon
          name="search"
          size={20}
          color="var(--color-grey-medium-2)"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
        />
        <Input
          type="search"
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          placeholder={t('users.filters.searchPlaceholder')}
          aria-label={t('users.filters.searchLabel')}
          className="rounded-full pl-11 pr-10"
        />
        {isSearching && (
          <Spinner className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        )}
      </div>

      <Select
        value={filters.role ?? ANY}
        onValueChange={(value) => onChange({ ...filters, role: value === ANY ? null : (value as UserRole) })}
      >
        <SelectTrigger aria-label={t('users.filters.roleLabel')} className="min-w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>{t('users.filters.anyRole')}</SelectItem>
          {SELECTABLE_USER_ROLES.map((role) => (
            <SelectItem key={role} value={role}>
              {t(`users.roles.${role}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.grade ?? ANY}
        onValueChange={(value) => onChange({ ...filters, grade: value === ANY ? null : value })}
      >
        <SelectTrigger
          aria-label={t('users.filters.gradeLabel')}
          disabled={grades.length === 0}
          className="min-w-44"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>{t('users.filters.anyGrade')}</SelectItem>
          {grades.map((grade) => (
            <SelectItem key={grade} value={grade}>
              {grade}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status ?? ANY}
        onValueChange={(value) =>
          onChange({ ...filters, status: value === ANY ? null : (value as ServiceUserStatus) })
        }
      >
        <SelectTrigger aria-label={t('users.filters.statusLabel')} className="min-w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>{t('users.filters.anyStatus')}</SelectItem>
          {SERVICE_USER_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {t(`users.status.${status}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
