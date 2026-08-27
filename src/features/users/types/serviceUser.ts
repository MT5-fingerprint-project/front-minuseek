import { z } from 'zod'
import i18n from '@/features/shared/lib/i18n'
import type { UserProfile, UserRole } from '@/features/shared/types/user'

export const SERVICE_USER_STATUSES = ['ACTIVE', 'DISABLED'] as const

export type ServiceUserStatus = (typeof SERVICE_USER_STATUSES)[number]

export type ServiceUser = UserProfile & {
  status: ServiceUserStatus
}

export type ServiceUsersFilters = {
  search: string
  role: UserRole | null
  grade: string | null
  status: ServiceUserStatus | null
}

export type ServiceUsersQuery = ServiceUsersFilters & {
  page: number
  limit: number
}

export const NO_SERVICE_USERS_FILTER: ServiceUsersFilters = {
  search: '',
  role: null,
  grade: null,
  status: null,
}

export function hasServiceUsersFilter({ search, role, grade, status }: ServiceUsersFilters): boolean {
  return Boolean(search || role || grade || status)
}

export const serviceUserProfileSchema = z.object({
  lastName: z.string().trim().min(1, i18n.t('users.validation.lastNameRequired')),
  firstName: z.string().trim().min(1, i18n.t('users.validation.firstNameRequired')),
  grade: z.string().trim().min(1, i18n.t('users.validation.gradeRequired')),
  serviceNumber: z.string().trim().min(1, i18n.t('users.validation.serviceNumberRequired')),
})

export type ServiceUserProfileInput = z.infer<typeof serviceUserProfileSchema>
