import { useQuery } from '@tanstack/react-query'
import { CurrentUserAPI } from '@/features/shared/services/CurrentUserAPI.services'

export const currentUserKeys = {
  profile: () => ['current-user'] as const,
}

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserKeys.profile(),
    queryFn: () => CurrentUserAPI.getProfile(),
  })
}
