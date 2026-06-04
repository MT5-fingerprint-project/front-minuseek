import { Badge } from '@/features/shared/ui/badge'
import { useTranslation } from 'react-i18next'
import type { InvestigationCaseStatus } from '@/features/investigation-case/types/investigationCase'

interface CaseStatusBadgeProps {
  status: InvestigationCaseStatus
}

const colors: Record<InvestigationCaseStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  OPEN: 'default',
  IN_PROGRESS: 'secondary',
  UNDER_REVIEW: 'outline',
  CLOSED: 'destructive',
}

export function CaseStatusBadge({ status }: CaseStatusBadgeProps) {
  const { t } = useTranslation()

  return (
    <Badge variant={colors[status]}>
      {t(`investigationCase.status.${status}`)}
    </Badge>
  )
}
