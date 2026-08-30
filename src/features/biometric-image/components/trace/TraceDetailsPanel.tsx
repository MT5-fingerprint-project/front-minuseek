import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '@/features/shared/icons'
import { Button } from '@/features/shared/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/features/shared/ui/sheet'
import { Spinner } from '@/features/shared/ui/spinner'
import TraceDescriptionForm from '@/features/biometric-image/components/trace/TraceDescriptionForm'
import { useDescribeTrace, useTrace } from '@/features/biometric-image/hooks/useBiometricImages'
import type { BiometricImage } from '@/features/biometric-image/types/biometricImage'
import type {
  RevelationTechnique,
  TraceDescriptionInput,
  TraceOrigin,
} from '@/features/biometric-image/types/trace'

type TraceDetailsPanelProps = {
  traceId: string
  caseId: string
  traces: BiometricImage[]
  isOpen: boolean
  onClose: () => void
}

function InfoRow({ icon, label, value }: { icon: IconName; label: string; value: string | null }) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon name={icon} size={20} color="var(--color-grey-medium-1)" />
      <span className="font-medium text-muted-foreground">{label}</span>
      <span>{value || t('trace.panel.notProvided')}</span>
    </div>
  )
}

// On révèle une dizaine de traces d'affilée avec le même produit : la technique
// de la trace précédente est le meilleur point de départ.
function previousTraceTechnique(traces: BiometricImage[], currentTrace: BiometricImage): RevelationTechnique | null {
  const currentNumber = currentTrace.number
  if (currentNumber === null) return null

  let previousNumber: number | null = null
  let previousTechnique: RevelationTechnique | null = null

  for (const trace of traces) {
    if (trace.number === null || trace.revelationTechnique === null) continue
    if (trace.number >= currentNumber) continue
    if (previousNumber === null || trace.number > previousNumber) {
      previousNumber = trace.number
      previousTechnique = trace.revelationTechnique
    }
  }

  return previousTechnique
}

export default function TraceDetailsPanel({ traceId, caseId, traces, isOpen, onClose }: TraceDetailsPanelProps) {
  const { t, i18n } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  const { data: trace, isPending, isError } = useTrace(traceId)
  const describeTrace = useDescribeTrace(caseId)
  const [editedTraceId, setEditedTraceId] = useState<string | null>(null)

  // Le back rend une trace de n'importe quelle affaire à laquelle on a accès :
  // une adresse recopiée d'un autre dossier ouvrirait une trace hors tableau.
  const isOutOfCase = trace !== undefined && trace.caseId !== caseId
  const isReadable = trace !== undefined && !isOutOfCase
  const depositedAt = trace ? new Date(trace.createdAt) : null

  return (
    <Sheet open={isOpen} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="right" showCloseButton={false} className="gap-0 data-[side=right]:w-1/2 data-[side=right]:sm:max-w-[50%]">
        <SheetHeader className="flex-row items-start justify-between gap-2 border-b border-grey-light-2">
          <div className="flex flex-col gap-1.5">
            <SheetTitle className="text-lg font-semibold">
              {isReadable ? trace.label : t('trace.panel.title')}
            </SheetTitle>
            <SheetDescription>
              {isReadable && depositedAt
                ? t('trace.panel.depositedAt', {
                    date: depositedAt.toLocaleDateString(i18n.language),
                    time: depositedAt.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' }),
                  })
                : t('trace.panel.title')}
            </SheetDescription>
          </div>
          <SheetClose asChild>
            <Button type="button" variant="greySecondary" size="small" aria-label={t('trace.panel.close')}>
              <Icon name="close" size={20} color="currentColor" />
            </Button>
          </SheetClose>
        </SheetHeader>

        {isPending ? (
          <div className="p-6">
            <Spinner className="size-6" />
          </div>
        ) : isError || !isReadable ? (
          <p className="p-6 text-sm text-muted-foreground">{t('trace.panel.unknown')}</p>
        ) : (
          <div className="flex flex-col gap-5 overflow-y-auto p-6">
            <img
              src={trace.url ?? undefined}
              alt={trace.label}
              className="max-h-80 w-full rounded-sm object-contain"
            />

            <Link
              to={`/${slug}/affaires/${caseId}/comparaison`}
              className="flex w-fit items-center gap-2 text-sm text-blue-medium-1 transition-colors hover:text-blue-dark-2"
            >
              <Icon name="compare" size={20} color="currentColor" />
              {t('trace.panel.openInComparator')}
            </Link>

            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{t('trace.panel.informations')}</h3>
                {editedTraceId !== trace.id && (
                  <Button
                    type="button"
                    variant="outline"
                    size="small"
                    onClick={() => setEditedTraceId(trace.id)}
                  >
                    {t('trace.description.edit')}
                  </Button>
                )}
              </div>

              {editedTraceId === trace.id ? (
                <TraceDescriptionForm
                  defaultValues={{
                    origin: trace.origin ?? ('' as TraceOrigin),
                    location: trace.location ?? '',
                    revelationTechnique:
                      trace.revelationTechnique ??
                      previousTraceTechnique(traces, trace) ??
                      ('' as RevelationTechnique),
                  }}
                  onSubmit={(description: TraceDescriptionInput) =>
                    describeTrace.mutateAsync({ id: trace.id, description })
                  }
                  onCancel={() => setEditedTraceId(null)}
                  onSuccess={() => setEditedTraceId(null)}
                />
              ) : (
                <div className="flex flex-col gap-3">
                  <InfoRow
                    icon="fingerprint"
                    label={t('trace.description.fields.origin.label')}
                    value={trace.origin ? t(`trace.origin.${trace.origin}`) : null}
                  />
                  <InfoRow
                    icon="location"
                    label={t('trace.description.fields.location.label')}
                    value={trace.location}
                  />
                  <InfoRow
                    icon="penTrace"
                    label={t('trace.description.fields.revelationTechnique.label')}
                    value={trace.revelationTechnique ? t(`trace.technique.${trace.revelationTechnique}`) : null}
                  />
                </div>
              )}
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
