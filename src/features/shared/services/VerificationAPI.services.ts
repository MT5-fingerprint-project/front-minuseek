import { apiClient } from '@/features/shared/lib/apiClient'
import type { CaseVerification } from '@/features/shared/types/verification'

export const MyVerificationsAPI = {
  listMine: () =>
    apiClient
      .get<CaseVerification[]>('/verifications', { params: { mine: 'true' } })
      .then((res) => res.data),
}
