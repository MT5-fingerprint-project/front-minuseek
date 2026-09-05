import { useTranslation } from 'react-i18next'
import { cn } from '@/features/shared/lib/utils'
import {
  CASE_STATUS_PILL,
  CASE_STATUS_STYLES,
} from '@/features/investigation-case/components/caseStatusStyles'
import type { InvestigationCaseStatus } from '@/features/investigation-case/types/investigationCase'

export function CaseStatusBadge({ status }: { status: InvestigationCaseStatus }) {
  const { t } = useTranslation()

  return (
    <span className={cn(CASE_STATUS_PILL, CASE_STATUS_STYLES[status])}>
      {t(`investigationCase.status.${status}`)}
    </span>
  )
}
