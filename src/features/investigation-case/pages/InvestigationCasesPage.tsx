import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { H1 } from '@/features/shared/ui/typography'
import { Button } from '@/features/shared/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/features/shared/ui/tabs'
import AppHeader from '@/features/shared/components/AppHeader'
import { useCurrentUser } from '@/features/shared/hooks/useCurrentUser'
import { useMyVerifications } from '@/features/shared/hooks/useMyVerifications'
import InvestigationCaseCreateForm from '@/features/investigation-case/components/InvestigationCaseCreateForm'
import InvestigationCasesList from '@/features/investigation-case/components/InvestigationCasesList'
import {
  useCreateInvestigationCase,
  useInvestigationCases,
} from '@/features/investigation-case/hooks/useInvestigationCases'
import type { InvestigationCase } from '@/features/investigation-case/types/investigationCase'

const TAB_PARAM = 'onglet'
const MINE = 'mes-affaires'
const VERIFICATIONS = 'mes-verifications'
const SERVICE = 'le-service'

export default function InvestigationCasesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useTranslation()

  const { data: investigationCases = [], isPending } = useInvestigationCases()
  const { data: verifications = [] } = useMyVerifications()
  const { data: currentUser } = useCurrentUser()
  const createInvestigationCase = useCreateInvestigationCase()

  const isServiceManager = currentUser?.role === 'ADMIN'
  const verifiedCaseIds = new Set(verifications.map((verification) => verification.caseId))

  const casesOf: Record<string, InvestigationCase[]> = {
    [MINE]: investigationCases.filter((investigationCase) => investigationCase.operator?.id === currentUser?.id),
    [VERIFICATIONS]: investigationCases.filter((investigationCase) => verifiedCaseIds.has(investigationCase.id)),
    [SERVICE]: investigationCases,
  }

  const tabs = isServiceManager ? [MINE, VERIFICATIONS, SERVICE] : [MINE, VERIFICATIONS]
  const requested = searchParams.get(TAB_PARAM) ?? ''
  const activeTab = tabs.includes(requested) ? requested : MINE

  const labelKeys: Record<string, 'mine' | 'verifications' | 'service'> = {
    [MINE]: 'mine',
    [VERIFICATIONS]: 'verifications',
    [SERVICE]: 'service',
  }

  return (
    <div className="flex flex-col">
      <AppHeader />
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

        <Tabs value={activeTab} onValueChange={(tab) => setSearchParams({ [TAB_PARAM]: tab })}>
          <TabsList variant="line">
            {tabs.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {t(`investigationCase.list.tabs.${labelKeys[tab]}`)} ({casesOf[tab].length})
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab} value={tab} className="pt-6">
              {!isPending && casesOf[tab].length === 0 ? (
                <p className="text-muted-foreground">
                  {t(`investigationCase.list.empty.${labelKeys[tab]}`)}
                </p>
              ) : (
                <InvestigationCasesList
                  investigationCases={casesOf[tab]}
                  isLoading={isPending}
                  onAddClick={() => setIsCreateDialogOpen(true)}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>

        <InvestigationCaseCreateForm
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={createInvestigationCase.mutateAsync}
        />
      </div>
    </div>
  )
}
