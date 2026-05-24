import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { H1 } from '../../shared/ui/typography'
import { Card, CardContent } from '@/features/shared/ui/card'

import type {
  InvestigationCase,
  InvestigationCaseCreateInput,
} from '@/features/investigation-case/types/investigationCase'
import InvestigationCaseCard from '@/features/investigation-case/components/InvestigationCaseCard'
import InvestigationCaseCreateForm from '@/features/investigation-case/components/InvestigationCaseCreateForm'

import { InvestigationCaseAPI } from '@/features/investigation-case/services/InvestigationCaseAPI.services'

export default function InvestigationCasesPage() {
  const [investigationCases, setInvestigationCases] = useState<InvestigationCase[]>([
    {
      id: '1',
      caseNumber: '2023-001',
      pvNumber: 'PV-2023-001',
      description: "Description de l'affaire 2023-001",
      location: '10 rue de la paix, 75002 Paris',
      status: 'OPEN',
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-20'),
    },
  ])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { t } = useTranslation()

  const handleInvestigationCaseCreate = async (formValues: InvestigationCaseCreateInput) => {
    const createdCase = await InvestigationCaseAPI.create(formValues)
    setInvestigationCases((previous) => [...previous, createdCase])
  }

  useEffect(() => {
    const fetchInvestigationCases = async () => {
      const cases = await InvestigationCaseAPI.getAll()
      setInvestigationCases(cases)
    }

    fetchInvestigationCases()
  }, [])

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

        {investigationCases.map((investigationCase) => (
          <InvestigationCaseCard key={investigationCase.id} investigationCase={investigationCase} />
        ))}
      </div>

      <InvestigationCaseCreateForm
        isCreateDialogOpen={isCreateDialogOpen}
        setIsCreateDialogOpen={setIsCreateDialogOpen}
        onSubmit={handleInvestigationCaseCreate}
      />
    </div>
  )
}
