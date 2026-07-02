import { dataApiClient } from '@/features/shared/lib/apiClient'
import type { DataCompareInput, DataCompareResponse } from '../types/data'

export const DataAPI = {
  compare: (input: DataCompareInput): Promise<DataCompareResponse> =>
    dataApiClient
      .post<DataCompareResponse>('/compare', input)
      .then((res) => res.data),
}
