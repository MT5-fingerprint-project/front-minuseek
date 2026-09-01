import { useTranslation } from 'react-i18next'
import { cn } from '@/features/shared/lib/utils'
import { Button } from '@/features/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/shared/ui/tooltip'
import {
  useDeclareExploitability,
  useDeclareNotIdentified,
  useWithdrawNotIdentified,
} from '@/features/biometric-image/hooks/useBiometricImages'
import type { BiometricImage } from '@/features/biometric-image/types/biometricImage'

type TraceDeclarationButtonsProps = {
  trace: Pick<BiometricImage, 'id' | 'status' | 'notIdentified'>
  caseId: string
  /** `panel` (défaut) : boutons pleins + explications, pour le panneau de la trace.
   *  `compact` : toggle Inexploitable/Exploitable + bouton Non identifiée séparé,
   *  pour la barre du bas du comparateur. Deux contrôles distincts : l'exploitabilité
   *  est exclusive (Inex XOR Exp), la non-identification est indépendante — les
   *  fondre dans un même toggle laisserait croire à tort qu'elles s'excluent aussi. */
  variant?: 'panel' | 'compact'
}

function CompactSegment({
  active,
  label,
  ariaLabel,
  disabled,
  onClick,
  className,
}: {
  active: boolean
  label: string
  ariaLabel: string
  disabled: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'rounded-full px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50',
        active ? 'bg-blue-medium-1 text-white' : 'text-grey-medium-2 hover:text-grey-dark',
        className,
      )}
    >
      {label}
    </button>
  )
}

export default function TraceDeclarationButtons({ trace, caseId, variant = 'panel' }: TraceDeclarationButtonsProps) {
  const { t } = useTranslation()
  const declareExploitability = useDeclareExploitability(caseId)
  const declareNotIdentified = useDeclareNotIdentified(caseId)
  const withdrawNotIdentified = useWithdrawNotIdentified(caseId)
  const isNotIdentifiedPending = declareNotIdentified.isPending || withdrawNotIdentified.isPending
  const toggleNotIdentified = () =>
    trace.notIdentified ? withdrawNotIdentified.mutate(trace.id) : declareNotIdentified.mutate(trace.id)
  const notIdentifiedAriaLabel = trace.notIdentified
    ? t('trace.exploitability.withdrawNotIdentified')
    : t('trace.exploitability.notIdentified')

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-0.5 rounded-full bg-grey-light-1 p-0.5">
          <CompactSegment
            active={trace.status === 'NOT_EXPLOITABLE'}
            label={t('trace.exploitability.notExploitableShort')}
            ariaLabel={t('trace.exploitability.notExploitable')}
            disabled={declareExploitability.isPending}
            onClick={() => declareExploitability.mutate({ id: trace.id, exploitable: false })}
          />
          <CompactSegment
            active={trace.status === 'EXPLOITABLE'}
            label={t('trace.exploitability.exploitableShort')}
            ariaLabel={t('trace.exploitability.exploitable')}
            disabled={declareExploitability.isPending}
            onClick={() => declareExploitability.mutate({ id: trace.id, exploitable: true })}
          />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="rounded-sm bg-grey-light-1 p-0.25">
              <CompactSegment
                active={!!trace.notIdentified}
                label={t('trace.exploitability.notIdentifiedShort')}
                ariaLabel={notIdentifiedAriaLabel}
                disabled={isNotIdentifiedPending}
                onClick={toggleNotIdentified}
                className="rounded-md"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>{notIdentifiedAriaLabel}</TooltipContent>
        </Tooltip>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={trace.status === 'EXPLOITABLE' ? 'blue' : 'outline'}
          size="small"
          disabled={declareExploitability.isPending}
          onClick={() => declareExploitability.mutate({ id: trace.id, exploitable: true })}
        >
          {t('trace.exploitability.exploitable')}
        </Button>
        <Button
          type="button"
          variant={trace.status === 'NOT_EXPLOITABLE' ? 'blue' : 'outline'}
          size="small"
          disabled={declareExploitability.isPending}
          onClick={() => declareExploitability.mutate({ id: trace.id, exploitable: false })}
        >
          {t('trace.exploitability.notExploitable')}
        </Button>
        <Button
          type="button"
          variant={trace.notIdentified ? 'blue' : 'outline'}
          size="small"
          disabled={isNotIdentifiedPending}
          aria-label={trace.notIdentified ? notIdentifiedAriaLabel : undefined}
          onClick={toggleNotIdentified}
        >
          {t('trace.exploitability.notIdentified')}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{t('trace.exploitability.hint')}</p>
      <p className="text-xs text-muted-foreground">{t('trace.exploitability.notIdentifiedHint')}</p>
    </div>
  )
}
