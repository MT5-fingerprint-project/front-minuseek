import { isAxiosError } from 'axios'
import { apiClient } from '@/features/shared/lib/apiClient'
import type { PaginatedResponse } from '@/features/shared/types/api'
import type {
  ServiceUser,
  ServiceUserProfileInput,
  ServiceUserStatus,
  ServiceUsersQuery,
} from '@/features/users/types/serviceUser'

export class DuplicateServiceNumberError extends Error {}

export const ServiceUserAPI = {
  getAll: ({ page, limit, search, role, grade, status }: ServiceUsersQuery) =>
    apiClient
      .get<PaginatedResponse<ServiceUser>>('/users', {
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(role ? { role } : {}),
          ...(grade ? { grade } : {}),
          ...(status ? { status } : {}),
        },
      })
      .then((res) => res.data),

  getGrades: () => apiClient.get<string[]>('/users/grades').then((res) => res.data),

  changeStatus: (userId: string, status: ServiceUserStatus) =>
    apiClient.patch<void>(`/users/${userId}/status`, { status }).then((res) => res.data),

  correctProfile: (userId: string, profile: ServiceUserProfileInput) =>
    apiClient
      .patch<void>(`/users/${userId}/profile`, profile)
      .then((res) => res.data)
      .catch((error: unknown) => {
        if (isAxiosError(error) && error.response?.status === 409) {
          throw new DuplicateServiceNumberError()
        }
        throw error
      }),
}
