import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Icon } from '@/features/shared/icons'
import { useCurrentUser } from '@/features/shared/hooks/useCurrentUser'
import {
  investigationCaseKeys,
  useCorrectInvestigationCase,
  useInvestigationCase,
} from '@/features/investigation-case/hooks/useInvestigationCases'
import { CaseStatusBadge } from '@/features/investigation-case/components/CaseStatusBadge'
import InvestigationCaseEditForm from '@/features/investigation-case/components/InvestigationCaseEditForm'
import WithdrawnPiecesSection from '@/features/investigation-case/components/WithdrawnPiecesSection'
import CaseClosureActions from '@/features/investigation-case/components/CaseClosureActions'
import ClosedCaseBanner from '@/features/investigation-case/components/ClosedCaseBanner'
import {
  operatorNameOf,
  type InvestigationCaseCorrections,
} from '@/features/investigation-case/types/investigationCase'
import { Button } from '@/features/shared/ui/button'
import { Spinner } from '@/features/shared/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/features/shared/ui/tabs'
import { H1 } from '@/features/shared/ui/typography'

/** Le premier onglet de la page Informations. L'en-tête judiciaire et les
 * destinataires poseront les leurs à côté. */
const CASE_TAB = 'case'

export default function InvestigationCaseDetailsPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t, i18n } = useTranslation()
  const { data: investigationCase, isPending } = useInvestigationCase(id ?? '')
  const { data: currentUser, isPending: isCurrentUserPending } = useCurrentUser()
  const correctCase = useCorrectInvestigationCase(id ?? '')
  const [isEditing, setIsEditing] = useState(false)

  if (isPending || isCurrentUserPending) return <Spinner className="size-6" />

  if (!investigationCase) return null

  const isServiceManager = currentUser?.role === 'ADMIN'
  const isCaseOperator = currentUser !== undefined && currentUser.id === investigationCase.operator?.id
  const canChangeOperator = isServiceManager || isCaseOperator
  const losesAccessOnHandover = isCaseOperator && !isServiceManager

  const updatedDate = new Date(investigationCase.updatedAt).toLocaleDateString(i18n.language)
  const updatedTime = new Date(investigationCase.updatedAt).toLocaleTimeString(i18n.language, {
    hour: '2-digit',
    minute: '2-digit',
  })
  const openedDate = new Date(investigationCase.createdAt).toLocaleDateString(i18n.language)

  async function handleCorrections(corrections: InvestigationCaseCorrections) {
    await correctCase.mutateAsync(corrections)

    if (corrections.operatorUserId !== undefined && losesAccessOnHandover) {
      queryClient.removeQueries({ queryKey: investigationCaseKeys.detail(id ?? '') })
      navigate(`/${slug}/affaires`, { replace: true })
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <H1 className="text-2xl font-bold">
            {t('investigationCase.details.title', { caseNumber: investigationCase.caseNumber })}
          </H1>
          <CaseStatusBadge status={investigationCase.status} />
          <CaseClosureActions investigationCase={investigationCase} />
        </div>
        <p className="text-sm text-muted-foreground">
          {t('investigationCase.details.updatedAt', { date: updatedDate, time: updatedTime })}
        </p>
      </div>

      <ClosedCaseBanner caseId={investigationCase.id} />

      <Tabs defaultValue={CASE_TAB}>
        <TabsList variant="line">
          <TabsTrigger value={CASE_TAB}>{t('investigationCase.details.tabs.case')}</TabsTrigger>
        </TabsList>

        <TabsContent value={CASE_TAB} className="flex flex-col gap-6 pt-4">
          <section className="flex flex-col gap-5 px-4 py-3  rounded-sm bg-white">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">{t('investigationCase.details.informations')}</h2>
              <Button variant="outline" size="small" onClick={() => setIsEditing(true)}>
                {t('investigationCase.details.edit')}
                <Icon name="pen" size={12} data-icon="inline-end" color="currentColor" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-x-16 gap-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Icon name="folder" size={20} color="var( --color-grey-medium-1)" />
                <span className="text-muted-foreground font-medium">{t('investigationCase.details.pvNumber')}</span>
                <span>{investigationCase.pvNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Icon name="dateStart" size={20} color="var( --color-grey-medium-1)" />
                <span className="text-muted-foreground font-medium">{t('investigationCase.details.openedAt')}</span>
                <span>{openedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Icon name="person" size={20} color="var( --color-grey-medium-1)" />
                <span className="text-muted-foreground font-medium">{t('investigationCase.details.operator')}</span>
                <span>
                  {investigationCase.operator
                    ? operatorNameOf(investigationCase.operator)
                    : t('investigationCase.details.noOperator')}
                </span>
              </div>
            </div>
          </section>

          {investigationCase.description && (
            <section className="flex flex-col gap-5 px-4 py-3 rounded-sm bg-blue-light-1">
              <h2 className="text-lg font-semibold">{t('investigationCase.details.context')}</h2>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground font-medium">{t('investigationCase.details.summary')}</p>
                <p className="text-sm leading-relaxed">{investigationCase.description}</p>
              </div>
            </section>
          )}

          <WithdrawnPiecesSection caseId={investigationCase.id} />
        </TabsContent>
      </Tabs>

      <InvestigationCaseEditForm
        investigationCase={isEditing ? investigationCase : null}
        canChangeOperator={canChangeOperator}
        losesAccessOnHandover={losesAccessOnHandover}
        onClose={() => setIsEditing(false)}
        onSubmit={handleCorrections}
      />
    </div>
  )
}
