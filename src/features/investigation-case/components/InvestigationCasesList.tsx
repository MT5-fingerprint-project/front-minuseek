import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Spinner } from '@/features/shared/ui/spinner'
import InvestigationCaseCard from '@/features/investigation-case/components/InvestigationCaseCard'
import NotchedCardFrame from '@/features/investigation-case/components/NotchedCardFrame'
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
    <div className="flex flex-wrap gap-4">
      {investigationCases?.length === 0 && (
        <button
          type="button"
          onClick={onAddClick}
          className="group relative block size-[200px] cursor-pointer text-center"
        >
          <NotchedCardFrame dashed />
          <span className="relative flex h-full items-center justify-center px-6 text-base font-medium text-blue-dark-1">
            <Plus className="mr-1 inline size-5 align-[-4px]" />
            {t('investigationCase.list.addNew')}
          </span>
        </button>)}

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
