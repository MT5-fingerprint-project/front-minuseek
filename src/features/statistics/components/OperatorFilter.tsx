import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/ui/select'
import type { UserProfile } from '@/features/shared/types/user'

const WHOLE_SERVICE_VALUE = 'tout-le-service'

type OperatorFilterProps = {
  operators: UserProfile[]
  selectedOperatorId: string | null
  onSelectOperator: (operatorId: string | null) => void
}

export default function OperatorFilter({ operators, selectedOperatorId, onSelectOperator }: OperatorFilterProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="statistics-operator" className="text-xs text-muted-foreground">
        {t('statistics.page.operatorLabel')}
      </label>
      <Select
        value={selectedOperatorId ?? WHOLE_SERVICE_VALUE}
        onValueChange={(operatorId) => onSelectOperator(operatorId === WHOLE_SERVICE_VALUE ? null : operatorId)}
      >
        <SelectTrigger id="statistics-operator" className="min-w-52 bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={WHOLE_SERVICE_VALUE}>{t('statistics.page.wholeService')}</SelectItem>
          {operators.map((operator) => (
            <SelectItem key={operator.id} value={operator.id}>
              {`${operator.firstName} ${operator.lastName}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
