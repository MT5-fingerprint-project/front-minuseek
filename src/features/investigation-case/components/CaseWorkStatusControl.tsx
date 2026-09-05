import { useTranslation } from 'react-i18next'
import { Button } from '@/features/shared/ui/button'
import { cn } from '@/features/shared/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/ui/select'
import { CaseStatusBadge } from '@/features/investigation-case/components/CaseStatusBadge'
import {
  CASE_STATUS_PILL,
  CASE_STATUS_STYLES,
} from '@/features/investigation-case/components/caseStatusStyles'
import { useChangeCaseStatus } from '@/features/investigation-case/hooks/useInvestigationCases'
import {
  SELECTABLE_CASE_STATUSES,
  type InvestigationCase,
  type SelectableCaseStatus,
} from '@/features/investigation-case/types/investigationCase'

export default function CaseWorkStatusControl({
  investigationCase,
}: {
  investigationCase: InvestigationCase
}) {
  const { t } = useTranslation()
  const changeStatus = useChangeCaseStatus(investigationCase.id)
  const { status } = investigationCase

  if (status === 'OPEN') {
    return (
      <>
        <CaseStatusBadge status={status} />
        <Button
          variant="grey"
          size="small"
          disabled={changeStatus.isPending}
          onClick={() => changeStatus.mutate('IN_PROGRESS')}
        >
          {t('investigationCase.workStatus.start')}
        </Button>
      </>
    )
  }

  if (status === 'CLOSED') return <CaseStatusBadge status={status} />

  return (
    <Select
      value={status}
      disabled={changeStatus.isPending}
      onValueChange={(next) => changeStatus.mutate(next as SelectableCaseStatus)}
    >
      <SelectTrigger
        aria-label={t('investigationCase.workStatus.label')}
        className={cn(CASE_STATUS_PILL, CASE_STATUS_STYLES[status], 'h-auto gap-1.5')}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SELECTABLE_CASE_STATUSES.map((selectable) => (
          <SelectItem key={selectable} value={selectable}>
            {t(`investigationCase.status.${selectable}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
