import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { ReportRecipientAPI } from '@/features/investigation-case/services/ReportRecipientAPI.services'
import type { CaseRecipientInput } from '@/features/investigation-case/types/reportRecipient'

export const reportRecipientKeys = {
  all: ['report-recipients'] as const,
  list: () => [...reportRecipientKeys.all, 'list'] as const,
}

/** Le carnet ne sert qu'au dialogue de choix : inutile de le charger sur chaque
 * ouverture de dossier. */
export function useReportRecipients(enabled = true) {
  return useQuery({
    queryKey: reportRecipientKeys.list(),
    queryFn: () => ReportRecipientAPI.list(),
    enabled,
  })
}

export function useAddReportRecipient() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (input: CaseRecipientInput) => ReportRecipientAPI.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportRecipientKeys.list() })
    },
    onError: () => {
      toast.error(t('investigationCase.recipient.bookSaveFailed'))
    },
  })
}

export function useRemoveReportRecipient() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => ReportRecipientAPI.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportRecipientKeys.list() })
      toast.success(t('investigationCase.recipient.removedFromBook'))
    },
    onError: () => {
      toast.error(t('investigationCase.recipient.bookRemoveFailed'))
    },
  })
}
