import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/features/shared/ui/card'
import { Spinner } from '@/features/shared/ui/spinner'
import InvestigationCaseCard from '@/features/investigation-case/components/InvestigationCaseCard'
import type { InvestigationCase } from '@/features/investigation-case/types/investigationCase'

type InvestigationCasesListProps = {
  investigationCases: InvestigationCase[]
  isLoading: boolean
  onAddClick: () => void
}

export default function InvestigationCasesList({
  investigationCases,
  isLoading,
  onAddClick,
}: InvestigationCasesListProps) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card
        className="border-2 border-dashed bg-transparent shadow-none cursor-pointer hover:bg-muted"
        role="button"
        tabIndex={0}
        onClick={onAddClick}
      >
        <CardContent className="flex h-full min-h-44 flex-col items-center justify-center gap-3 text-muted-foreground">
          <div className="flex size-10 items-center justify-center rounded-full border">
            <Plus className="size-5" />
          </div>
          <span className="text-sm font-medium">{t('investigationCase.list.addNew')}</span>
        </CardContent>
      </Card>

      {isLoading ? (
        <Spinner className="size-6" />
      ) : (
        investigationCases?.length > 0 &&
        investigationCases.map((investigationCase) => (
          <InvestigationCaseCard key={investigationCase.id} investigationCase={investigationCase} />
        ))
      )}
    </div>
  )
}
