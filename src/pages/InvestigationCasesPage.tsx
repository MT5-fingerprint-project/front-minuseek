import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { H1 } from '../components/ui/typography'
import { Card, CardContent } from '@/components/ui/card'

import type { InvestigationCase, InvestigationCaseCreateInput } from '@/types/investigationCase/investigationCase'
import InvestigationCaseCard from '@/components/investigationCase/InvestigationCaseCard'
import InvestigationCaseCreateForm from '@/components/investigationCase/InvestigationCaseCreateForm'

import { InvestigationCaseAPI } from '@/services/investigationCase/InvestigationCaseAPI.services'

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

  const handleInvestigationCaseCreate = async (formValues: InvestigationCaseCreateInput) => {
    const newCase: InvestigationCase = {
      ...formValues,
      id: String(Date.now()),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setInvestigationCases((previous) => [...previous, newCase])

    await InvestigationCaseAPI.create(newCase)
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
      <H1>Mes affaires</H1>

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
            <span className="text-sm font-medium">Ajouter une nouvelle affaire</span>
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
