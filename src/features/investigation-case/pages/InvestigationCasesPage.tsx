import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { H1 } from '@/features/shared/ui/typography'
import { Button } from '@/features/shared/ui/button'
import CasesHeader from '@/features/investigation-case/components/CasesHeader'
import InvestigationCaseCreateForm from '@/features/investigation-case/components/InvestigationCaseCreateForm'
import InvestigationCasesList from '@/features/investigation-case/components/InvestigationCasesList'
import {
  useCreateInvestigationCase,
  useInvestigationCases,
} from '@/features/investigation-case/hooks/useInvestigationCases'

export default function InvestigationCasesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { t } = useTranslation()

  const { data: investigationCases = [], isPending } = useInvestigationCases()
  const createInvestigationCase = useCreateInvestigationCase()

  return (
    <div className="flex flex-col">
      <CasesHeader />
      <div className="flex flex-col gap-10 px-32 py-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Icon name="folder" size={40} color="var(--color-blue-medium-1)" />
              <H1 className="text-blue-dark-2">{t('investigationCase.list.title')}</H1>
            </div>
            <Button type="button" variant="blue" onClick={() => setIsCreateDialogOpen(true)}>
              {t('investigationCase.list.create')}
              <Icon name="plus" size={24} color="white" />
            </Button>
          </div>
          <p className="text-muted-foreground">{t('investigationCase.list.subtitle')}</p>
        </div>

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
    </div >
  )
}
