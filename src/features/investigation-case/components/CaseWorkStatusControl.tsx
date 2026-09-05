import { useTranslation } from 'react-i18next'
import { Button } from '@/features/shared/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/ui/select'
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

  if (investigationCase.status === 'CLOSED') return null

  if (investigationCase.status === 'OPEN') {
    return (
      <Button
        variant="outline"
        size="small"
        disabled={changeStatus.isPending}
        onClick={() => changeStatus.mutate('IN_PROGRESS')}
      >
        {t('investigationCase.workStatus.start')}
      </Button>
    )
  }

  return (
    <Select
      value={investigationCase.status}
      disabled={changeStatus.isPending}
      onValueChange={(status) => changeStatus.mutate(status as SelectableCaseStatus)}
    >
      <SelectTrigger
        aria-label={t('investigationCase.workStatus.label')}
        className="h-8 min-w-44 bg-white"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SELECTABLE_CASE_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            {t(`investigationCase.status.${status}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
