import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { H1 } from '@/features/shared/ui/typography'
import InvestigationCaseCreateForm from '@/features/investigation-case/components/InvestigationCaseCreateForm'
import InvestigationCasesList from '@/features/investigation-case/components/InvestigationCasesList'
import {
  useCreateInvestigationCase,
  useInvestigationCases,
} from '@/features/investigation-case/hooks/useInvestigationCases'

export default function InvestigationCasesPage() {
  const { t } = useTranslation()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { data: investigationCases = [], isPending } = useInvestigationCases()
  const createInvestigationCase = useCreateInvestigationCase()

  return (
    <div className="flex flex-col gap-4 p-6">
      <H1>{t('investigationCase.list.title')}</H1>

      <InvestigationCasesList
        investigationCases={investigationCases}
        isLoading={isPending}
        onAddClick={() => setIsCreateDialogOpen(true)}
      />

      <InvestigationCaseCreateForm
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={createInvestigationCase.mutateAsync}
      />
    </div>
  )
}
