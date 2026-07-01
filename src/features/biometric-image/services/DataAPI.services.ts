import { dataApiClient } from '@/features/shared/lib/apiClient'
import type { DataCompareInput, DataCompareResponse } from '../types/data'

export const DataAPI = {
  compare: (input: DataCompareInput): Promise<DataCompareResponse> => {
    const formData = new FormData()
    
    formData.append('trace', input.trace)
    
    input.reference_prints.forEach((file) => {
      formData.append('reference_prints', file)
    })

    if (input.top !== undefined) {
      formData.append('top', String(input.top))
    }

    return dataApiClient
      .post<DataCompareResponse>('/compare', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => res.data)
  },
}
