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
  useUpdateCaseRecipient,
} from '@/features/investigation-case/hooks/useInvestigationCases'
import {
  useAddReportRecipient,
  useRemoveReportRecipient,
  useReportRecipients,
} from '@/features/investigation-case/hooks/useReportRecipients'
import type { CaseRecipientInput } from '@/features/investigation-case/types/reportRecipient'
import { CaseStatusBadge } from '@/features/investigation-case/components/CaseStatusBadge'
import InvestigationCaseEditForm from '@/features/investigation-case/components/InvestigationCaseEditForm'
import CaseJudicialHeaderSummary from '@/features/investigation-case/components/CaseJudicialHeaderSummary'
import CaseRecipientForm from '@/features/investigation-case/components/CaseRecipientForm'
import CaseRecipientSummary from '@/features/investigation-case/components/CaseRecipientSummary'
import WithdrawnPiecesSection from '@/features/investigation-case/components/WithdrawnPiecesSection'
import CaseVerificationsSection from '@/features/investigation-case/components/CaseVerificationsSection'
import CaseClosureActions from '@/features/investigation-case/components/CaseClosureActions'
import CaseWorkStatusControl from '@/features/investigation-case/components/CaseWorkStatusControl'
import ClosedCaseBanner from '@/features/investigation-case/components/ClosedCaseBanner'
import DeclareExpertiseDialog from '@/features/investigation-case/components/DeclareExpertiseDialog'
import ExpertiseBanner from '@/features/investigation-case/components/ExpertiseBanner'
import {
  caseUserNameOf,
  isJudicialHeaderEmpty,
  type InvestigationCaseCorrections,
} from '@/features/investigation-case/types/investigationCase'
import { Button } from '@/features/shared/ui/button'
import { Spinner } from '@/features/shared/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/features/shared/ui/tabs'
import { H1 } from '@/features/shared/ui/typography'

const CASE_TAB = 'case'
const RECIPIENT_TAB = 'recipient'

export default function InvestigationCaseDetailsPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t, i18n } = useTranslation()
  const { data: investigationCase, isPending } = useInvestigationCase(id ?? '')
  const { data: currentUser, isPending: isCurrentUserPending } = useCurrentUser()
  const correctCase = useCorrectInvestigationCase(id ?? '')
  const updateRecipient = useUpdateCaseRecipient(id ?? '')
  const [isEditing, setIsEditing] = useState(false)
  const [isChoosingRecipient, setIsChoosingRecipient] = useState(false)
  const [isDeclaringExpertise, setIsDeclaringExpertise] = useState(false)
  const { data: recipientBook = [] } = useReportRecipients(isChoosingRecipient)
  const addToBook = useAddReportRecipient()
  const removeFromBook = useRemoveReportRecipient()

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
  // Tant que rien n'est renseigné, le bouton dit ce qu'il reste à faire.
  const editLabel = isJudicialHeaderEmpty(investigationCase)
    ? t('investigationCase.judicialHeader.complete')
    : t('investigationCase.details.edit')

  /** La fiche part au carnet d'abord : le dossier porte ensuite une copie de ce
   * qui a été saisi, modifications comprises. Un carnet qui refuse la fiche ne
   * fait pas perdre le geste principal — il a déjà toasté son échec. */
  async function handleRecipient(input: CaseRecipientInput, alsoSaveToBook: boolean) {
    if (alsoSaveToBook) {
      await addToBook.mutateAsync(input).catch(() => undefined)
    }
    await updateRecipient.mutateAsync(input)
  }

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
          <CaseWorkStatusControl investigationCase={investigationCase} />
          <CaseClosureActions investigationCase={investigationCase} />
          {isCaseOperator && !investigationCase.expertise && (
            <Button variant="outline" size="small" onClick={() => setIsDeclaringExpertise(true)}>
              {t('investigationCase.expertise.declare')}
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {t('investigationCase.details.updatedAt', { date: updatedDate, time: updatedTime })}
        </p>
      </div>

      <ClosedCaseBanner caseId={investigationCase.id} />

      {investigationCase.expertise && <ExpertiseBanner expertise={investigationCase.expertise} />}

      <Tabs defaultValue={CASE_TAB}>
        <TabsList variant="line">
          <TabsTrigger value={CASE_TAB}>{t('investigationCase.details.tabs.case')}</TabsTrigger>
          <TabsTrigger value={RECIPIENT_TAB}>{t('investigationCase.details.tabs.recipient')}</TabsTrigger>
        </TabsList>

        <TabsContent value={CASE_TAB} className="flex flex-col gap-6 pt-4">
          <section className="flex flex-col gap-5 px-4 py-3  rounded-sm bg-white">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">{t('investigationCase.details.informations')}</h2>
              <Button variant="outline" size="small" onClick={() => setIsEditing(true)}>
                {editLabel}
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
                    ? caseUserNameOf(investigationCase.operator)
                    : t('investigationCase.details.noOperator')}
                </span>
              </div>
            </div>
          </section>

          <CaseJudicialHeaderSummary investigationCase={investigationCase} />

          {investigationCase.description && (
            <section className="flex flex-col gap-5 px-4 py-3 rounded-sm bg-blue-light-1">
              <h2 className="text-lg font-semibold">{t('investigationCase.details.context')}</h2>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground font-medium">{t('investigationCase.details.summary')}</p>
                <p className="text-sm leading-relaxed">{investigationCase.description}</p>
              </div>
            </section>
          )}

          <CaseVerificationsSection
            caseId={investigationCase.id}
            operatorUserId={investigationCase.operator?.id ?? null}
            canEntrust={canChangeOperator}
          />

          <WithdrawnPiecesSection caseId={investigationCase.id} />
        </TabsContent>

        <TabsContent value={RECIPIENT_TAB} className="flex flex-col gap-6 pt-4">
          <CaseRecipientSummary
            investigationCase={investigationCase}
            onEdit={() => setIsChoosingRecipient(true)}
          />
        </TabsContent>
      </Tabs>

      <DeclareExpertiseDialog
        caseId={investigationCase.id}
        open={isDeclaringExpertise}
        onOpenChange={setIsDeclaringExpertise}
      />

      <CaseRecipientForm
        investigationCase={isChoosingRecipient ? investigationCase : null}
        book={recipientBook}
        onClose={() => setIsChoosingRecipient(false)}
        onSubmit={handleRecipient}
        onRemoveFromBook={(entryId) => removeFromBook.mutate(entryId)}
      />

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
