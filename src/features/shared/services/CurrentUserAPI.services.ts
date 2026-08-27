import { apiClient } from '@/features/shared/lib/apiClient'
import type { UserProfile } from '@/features/shared/types/user'

export const CurrentUserAPI = {
  getProfile: () => apiClient.get<UserProfile>('/me').then((res) => res.data),
}
