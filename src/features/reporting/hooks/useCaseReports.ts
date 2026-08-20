import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { ReportAPI } from '@/features/reporting/services/ReportAPI.services'
import type { ReportType } from '@/features/reporting/types/report'

export const reportKeys = {
  all: ['reports'] as const,
  case: (caseId: string) => [...reportKeys.all, 'case', caseId] as const,
}

export function useCaseReports(caseId: string) {
  return useQuery({
    queryKey: reportKeys.case(caseId),
    queryFn: () => ReportAPI.getByCase(caseId),
    enabled: !!caseId,
  })
}

export function useGenerateReport(caseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (type: ReportType) => ReportAPI.generate(caseId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.case(caseId) })
      toast.success(t('reporting.success.generated'))
    },
  })
}

export function useDownloadReport() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (reportId: string) => ReportAPI.getDownload(reportId),
    onSuccess: ({ url }) => {
      window.open(url, '_blank', 'noopener,noreferrer')
    },
    onError: () => {
      toast.error(t('reporting.errors.downloadFailed'))
    },
  })
}
