import { isAxiosError } from 'axios'
import { apiClient } from '@/features/shared/lib/apiClient'
import type {
  CaseVerification,
  VerificationDetail,
  VerificationExploitability,
} from '@/features/shared/types/verification'

export type VerificationRefusal =
  | 'unknownVerifier'
  | 'notAllowed'
  | 'caseNotFound'
  | 'caseClosedOrAlreadyPending'

export class VerificationRefusedError extends Error {
  readonly refusal: VerificationRefusal

  constructor(refusal: VerificationRefusal) {
    super(refusal)
    this.refusal = refusal
  }
}

const REFUSAL_BY_STATUS: Record<number, VerificationRefusal | undefined> = {
  400: 'unknownVerifier',
  403: 'notAllowed',
  404: 'caseNotFound',
  409: 'caseClosedOrAlreadyPending',
}

export const VerificationAPI = {
  listForCase: (caseId: string) =>
    apiClient
      .get<CaseVerification[]>(`/investigation-cases/${caseId}/verifications`)
      .then((res) => res.data),

  entrust: (caseId: string, verifierUserId: string) =>
    apiClient
      .post<{ id: string }>(`/investigation-cases/${caseId}/verifications`, { verifierUserId })
      .then((res) => res.data)
      .catch((error: unknown) => {
        const refusal = isAxiosError(error) ? REFUSAL_BY_STATUS[error.response?.status ?? 0] : undefined
        if (refusal) {
          throw new VerificationRefusedError(refusal)
        }
        throw error
      }),

  getDetail: (verificationId: string) =>
    apiClient.get<VerificationDetail>(`/verifications/${verificationId}`).then((res) => res.data),

  conclude: (
    verificationId: string,
    traceId: string,
    conclusion: { exploitability: VerificationExploitability; identifiedReferencePrintId: string | null }
  ) =>
    apiClient
      .put<void>(`/verifications/${verificationId}/conclusions/${traceId}`, conclusion)
      .then(() => undefined),

  complete: (verificationId: string) =>
    apiClient.post<void>(`/verifications/${verificationId}/completion`).then(() => undefined),
}
