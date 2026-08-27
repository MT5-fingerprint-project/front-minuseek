import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { ServiceUserAPI } from '@/features/users/services/ServiceUserAPI.services'
import type { ServiceUserProfileInput, ServiceUsersQuery } from '@/features/users/types/serviceUser'

export const serviceUserKeys = {
  all: ['service-users'] as const,
  lists: () => [...serviceUserKeys.all, 'list'] as const,
  list: ({ page, limit, search, role, grade, status }: ServiceUsersQuery) =>
    [...serviceUserKeys.lists(), page, limit, search, role, grade, status] as const,
  grades: () => [...serviceUserKeys.all, 'grades'] as const,
}

export function useServiceUsers(query: ServiceUsersQuery, enabled = true) {
  return useQuery({
    queryKey: serviceUserKeys.list(query),
    queryFn: () => ServiceUserAPI.getAll(query),
    enabled,
    placeholderData: keepPreviousData,
  })
}

/** Les grades sont saisis à la main : leurs valeurs distinctes viennent du service, pas d'une énumération. */
export function useServiceUserGrades(enabled = true) {
  return useQuery({
    queryKey: serviceUserKeys.grades(),
    queryFn: () => ServiceUserAPI.getGrades(),
    enabled,
  })
}

export function useDeactivateServiceUser() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (userId: string) => ServiceUserAPI.changeStatus(userId, 'DISABLED'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceUserKeys.lists() })
      toast.success(t('users.success.deactivated'))
    },
    onError: () => {
      toast.error(t('users.errors.deactivateFailed'))
    },
  })
}

export function useReactivateServiceUser() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (userId: string) => ServiceUserAPI.changeStatus(userId, 'ACTIVE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceUserKeys.lists() })
      toast.success(t('users.success.reactivated'))
    },
    onError: () => {
      toast.error(t('users.errors.reactivateFailed'))
    },
  })
}

export function useUpdateServiceUserProfile() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ userId, profile }: { userId: string; profile: ServiceUserProfileInput }) =>
      ServiceUserAPI.correctProfile(userId, profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceUserKeys.lists() })
      queryClient.invalidateQueries({ queryKey: serviceUserKeys.grades() })
      toast.success(t('users.success.profileUpdated'))
    },
  })
}
