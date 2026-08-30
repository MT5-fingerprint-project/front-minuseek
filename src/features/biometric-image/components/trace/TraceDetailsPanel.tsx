import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
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
import { useTrace } from '@/features/biometric-image/hooks/useBiometricImages'

type TraceDetailsPanelProps = {
  traceId: string
  caseId: string
  isOpen: boolean
  onClose: () => void
}

export default function TraceDetailsPanel({ traceId, caseId, isOpen, onClose }: TraceDetailsPanelProps) {
  const { t, i18n } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  const { data: trace, isPending, isError } = useTrace(traceId)

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

            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">{t('trace.panel.informations')}</h3>
              <p className="text-sm text-muted-foreground">{t('trace.panel.notProvided')}</p>
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
