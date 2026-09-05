import { isAxiosError } from 'axios'
import { apiClient } from '@/features/shared/lib/apiClient'
import type {
  CaseExpertiseDeclaration,
  InvestigationCase,
  InvestigationCaseCorrections,
  InvestigationCaseCreateInput,
  SelectableCaseStatus,
} from '@/features/investigation-case/types/investigationCase'
import type { CaseRecipientInput } from '@/features/investigation-case/types/reportRecipient'

export type CaseCorrectionRefusal = 'unknownOperator' | 'operatorChangeNotAllowed' | 'caseNotFound' | 'caseClosed'

export class CaseCorrectionRefusedError extends Error {
  readonly refusal: CaseCorrectionRefusal

  constructor(refusal: CaseCorrectionRefusal) {
    super(refusal)
    this.refusal = refusal
  }
}

const REFUSAL_BY_STATUS: Record<number, CaseCorrectionRefusal | undefined> = {
  403: 'operatorChangeNotAllowed',
  404: 'caseNotFound',
  409: 'caseClosed',
}

function refusalOf(status: number, corrections: InvestigationCaseCorrections): CaseCorrectionRefusal | undefined {
  // Le 400 sert aussi au refus de validation : il ne parle du compte désigné que
  // si l'appel en portait un.
  if (status === 400) {
    return corrections.operatorUserId !== undefined ? 'unknownOperator' : undefined
  }
  return REFUSAL_BY_STATUS[status]
}

export const InvestigationCaseAPI = {
  create: (caseData: InvestigationCaseCreateInput) =>
    apiClient.post<InvestigationCase>('/investigation-cases', caseData).then((res) => res.data),

  getAll: () => apiClient.get<{ data: InvestigationCase[] }>('/investigation-cases').then((res) => res.data),

  getById: (id: string) => apiClient.get<InvestigationCase>(`/investigation-cases/${id}`).then((res) => res.data),

  close: (id: string) =>
    apiClient
      .post<InvestigationCase>(`/investigation-cases/${id}/closure`)
      .then((res) => res.data),

  reopen: (id: string, reason: string) =>
    apiClient
      .post<InvestigationCase>(`/investigation-cases/${id}/reopening`, { reason })
      .then((res) => res.data),

  changeStatus: (id: string, status: SelectableCaseStatus) =>
    apiClient
      .put<InvestigationCase>(`/investigation-cases/${id}/status`, { status })
      .then((res) => res.data),

  declareExpertise: (id: string, declaration: CaseExpertiseDeclaration) =>
    apiClient
      .post<InvestigationCase>(`/investigation-cases/${id}/expertise`, declaration)
      .then((res) => res.data),

  // Les trois lignes forment un bloc : ce qui n'est pas envoyé est effacé du
  // dossier, une ligne vide n'est donc pas envoyée du tout.
  updateRecipient: (id: string, input: CaseRecipientInput) =>
    apiClient
      .put<InvestigationCase>(`/investigation-cases/${id}/recipient`, {
        authority: input.authority,
        attentionQuality: input.attentionQuality || undefined,
        attentionName: input.attentionName || undefined,
      })
      .then((res) => res.data),

  correct: (id: string, corrections: InvestigationCaseCorrections) =>
    apiClient
      .patch<void>(`/investigation-cases/${id}`, corrections)
      .then(() => undefined)
      .catch((error: unknown) => {
        const refusal = isAxiosError(error) ? refusalOf(error.response?.status ?? 0, corrections) : undefined
        if (refusal) {
          throw new CaseCorrectionRefusedError(refusal)
        }
        throw error
      }),
}
