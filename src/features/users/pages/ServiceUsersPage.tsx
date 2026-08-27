import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { H1 } from '@/features/shared/ui/typography'
import { Spinner } from '@/features/shared/ui/spinner'
import AppHeader from '@/features/shared/components/AppHeader'
import { useCurrentUser } from '@/features/shared/hooks/useCurrentUser'
import { useDebouncedValue } from '@/features/shared/hooks/useDebouncedValue'
import DeactivateServiceUserDialog from '@/features/users/components/DeactivateServiceUserDialog'
import ServiceUserProfileForm from '@/features/users/components/ServiceUserProfileForm'
import ServiceUsersPagination from '@/features/users/components/ServiceUsersPagination'
import ServiceUsersToolbar from '@/features/users/components/ServiceUsersToolbar'
import ServiceUsersTable from '@/features/users/components/ServiceUsersTable'
import {
  useDeactivateServiceUser,
  useReactivateServiceUser,
  useServiceUserGrades,
  useServiceUsers,
  useUpdateServiceUserProfile,
} from '@/features/users/hooks/useServiceUsers'
import {
  hasServiceUsersFilter,
  NO_SERVICE_USERS_FILTER,
  type ServiceUser,
  type ServiceUserProfileInput,
  type ServiceUsersFilters,
} from '@/features/users/types/serviceUser'

const PAGE_SIZE = 20

export default function ServiceUsersPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<ServiceUsersFilters>(NO_SERVICE_USERS_FILTER)
  const [userToEdit, setUserToEdit] = useState<ServiceUser | null>(null)
  const [userToDeactivate, setUserToDeactivate] = useState<ServiceUser | null>(null)

  const { data: currentUser, isPending: isCurrentUserPending } = useCurrentUser()
  const isServiceManager = currentUser?.role === 'ADMIN'

  const debouncedSearch = useDebouncedValue(filters.search.trim())
  const appliedFilters = { ...filters, search: debouncedSearch }
  const usersQuery = useServiceUsers({ ...appliedFilters, page, limit: PAGE_SIZE }, isServiceManager)
  const gradesQuery = useServiceUserGrades(isServiceManager)
  const deactivateUser = useDeactivateServiceUser()
  const reactivateUser = useReactivateServiceUser()
  const updateProfile = useUpdateServiceUserProfile()

  const pendingUserId = deactivateUser.isPending
    ? (deactivateUser.variables ?? null)
    : reactivateUser.isPending
      ? (reactivateUser.variables ?? null)
      : null

  function handleFiltersChange(nextFilters: ServiceUsersFilters) {
    setFilters(nextFilters)
    setPage(1)
  }

  async function handleProfileSubmit(values: ServiceUserProfileInput) {
    if (!userToEdit) {
      return
    }
    await updateProfile.mutateAsync({ userId: userToEdit.id, profile: values })
  }

  return (
    <div className="flex flex-col">
      <AppHeader />
      <div className="flex flex-col gap-10 px-32 py-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <Icon name="personGroup" size={40} color="var(--color-blue-medium-1)" />
            <H1 className="text-blue-dark-2">{t('users.list.title')}</H1>
          </div>
          <p className="text-muted-foreground">{t('users.list.subtitle')}</p>
        </div>

        {isCurrentUserPending ? (
          <Spinner className="size-6" />
        ) : !isServiceManager ? (
          <p className="rounded-sm bg-white px-4 py-3 text-sm text-muted-foreground">{t('users.list.restricted')}</p>
        ) : (
          <>
            <ServiceUsersToolbar
              filters={filters}
              grades={gradesQuery.data ?? []}
              isSearching={filters.search.trim() !== debouncedSearch || usersQuery.isFetching}
              onChange={handleFiltersChange}
            />

            {usersQuery.isPending ? (
              <Spinner className="size-6" />
            ) : usersQuery.isError ? (
              <p className="rounded-sm bg-white px-4 py-3 text-sm text-destructive">{t('users.list.error')}</p>
            ) : (
              <section className="rounded-sm bg-white">
                <ServiceUsersTable
                  users={usersQuery.data.data}
                  currentUserId={currentUser?.id}
                  pendingUserId={pendingUserId}
                  emptyMessage={hasServiceUsersFilter(appliedFilters) ? t('users.list.noMatch') : t('users.list.empty')}
                  onEdit={setUserToEdit}
                  onDeactivate={setUserToDeactivate}
                  onReactivate={(user) => reactivateUser.mutate(user.id)}
                />
                <ServiceUsersPagination
                  meta={usersQuery.data.meta}
                  isFetching={usersQuery.isFetching}
                  onPreviousPage={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                  onNextPage={() => setPage((currentPage) => currentPage + 1)}
                />
              </section>
            )}
          </>
        )}

        <ServiceUserProfileForm
          user={userToEdit}
          onClose={() => setUserToEdit(null)}
          onSubmit={handleProfileSubmit}
        />

        <DeactivateServiceUserDialog
          user={userToDeactivate}
          onClose={() => setUserToDeactivate(null)}
          onConfirm={(user) => {
            setUserToDeactivate(null)
            deactivateUser.mutate(user.id)
          }}
        />
      </div>
    </div>
  )
}
