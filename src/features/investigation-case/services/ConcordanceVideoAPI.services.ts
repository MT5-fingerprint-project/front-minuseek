import { apiClient } from '@/features/shared/lib/apiClient'

export type DepositConcordanceVideoInput = {
  traceId: string
  referencePrintId: string
  file: File
}

export const ConcordanceVideoAPI = {
  deposit: (caseId: string, { traceId, referencePrintId, file }: DepositConcordanceVideoInput) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('traceId', traceId)
    formData.append('referencePrintId', referencePrintId)

    return apiClient
      .post<{ sha256: string }>(`/investigation-cases/${caseId}/concordance-videos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data)
  },
}
