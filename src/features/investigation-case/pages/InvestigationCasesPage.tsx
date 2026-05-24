import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { H1 } from '../../shared/ui/typography'
import { Card, CardContent } from '@/features/shared/ui/card'

import type { InvestigationCaseCreateInput } from '@/features/investigation-case/types/investigationCase'
import InvestigationCaseCard from '@/features/investigation-case/components/InvestigationCaseCard'
import InvestigationCaseCreateForm from '@/features/investigation-case/components/InvestigationCaseCreateForm'

import {
  useCreateInvestigationCase,
  useInvestigationCases,
} from '@/features/investigation-case/hooks/useInvestigationCases'
import { Spinner } from '@/features/shared/ui/spinner'

export default function InvestigationCasesPage() {
  const { t } = useTranslation()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { data: investigationCases = [], isPending, isError } = useInvestigationCases()
  const createInvestigationCase = useCreateInvestigationCase()

  const handleInvestigationCaseCreate = async (formValues: InvestigationCaseCreateInput) => {
    await createInvestigationCase.mutateAsync(formValues)
  }

  useEffect(() => {
    if (isError) {
      toast.error(t('common.errors.loadFailed'))
    }
  }, [isError, t])

  return (
    <div className="flex flex-col gap-4">
      <H1>{t('investigationCase.list.title')}</H1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          className="border-2 border-dashed bg-transparent shadow-none cursor-pointer hover:bg-muted"
          role="button"
          tabIndex={0}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <CardContent className="flex h-full min-h-44 flex-col items-center justify-center gap-3 text-muted-foreground">
            <div className="flex size-10 items-center justify-center rounded-full border">
              <Plus className="size-5" />
            </div>
            <span className="text-sm font-medium">{t('investigationCase.list.addNew')}</span>
          </CardContent>
        </Card>

        {isPending ? (
          <Spinner className="size-6" />
        ) : (
          investigationCases.map((investigationCase) => (
            <InvestigationCaseCard key={investigationCase.id} investigationCase={investigationCase} />
          ))
        )}
      </div>

      <InvestigationCaseCreateForm
        isCreateDialogOpen={isCreateDialogOpen}
        setIsCreateDialogOpen={setIsCreateDialogOpen}
        onSubmit={handleInvestigationCaseCreate}
      />
    </div>
  )
}
