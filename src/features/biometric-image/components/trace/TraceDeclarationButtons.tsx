import { useTranslation } from 'react-i18next'
import { ChevronDownIcon } from 'lucide-react'
import { cn } from '@/features/shared/lib/utils'
import { Button } from '@/features/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/features/shared/ui/dropdown-menu'
import {
  useDeclareExploitability,
  useDeclareNotIdentified,
  useWithdrawNotIdentified,
} from '@/features/biometric-image/hooks/useBiometricImages'
import type { BiometricImage } from '@/features/biometric-image/types/biometricImage'

type TraceDeclarationButtonsProps = {
  trace: Pick<BiometricImage, 'id' | 'status' | 'notIdentified'>
  caseId: string
  variant?: 'panel' | 'compact'
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
    const shortLabelParts = [
      trace.status === 'EXPLOITABLE'
        ? t('trace.exploitability.exploitableShort')
        : trace.status === 'NOT_EXPLOITABLE'
          ? t('trace.exploitability.notExploitableShort')
          : null,
      trace.notIdentified ? t('trace.exploitability.notIdentifiedShort') : null,
    ].filter((part): part is string => part !== null)
    const triggerLabel = shortLabelParts.length > 0 ? shortLabelParts.join(' · ') : t('trace.state.toQualify')
    const itemClassName = 'rounded py-1.5 pr-6 pl-2 text-sm text-white focus:bg-white/10 focus:text-white'

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={declareExploitability.isPending || isNotIdentifiedPending}
            aria-label={t('trace.exploitability.title')}
            className={cn(
              'flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50',
              shortLabelParts.length > 0
                ? 'bg-blue-medium-1 text-white'
                : 'bg-grey-light-1 text-grey-medium-2 hover:text-grey-dark',
            )}
          >
            {triggerLabel}
            <ChevronDownIcon className="size-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="min-w-36 rounded-md border-0 bg-blue-dark-1 p-1 text-white shadow-lg ring-0"
        >
          <DropdownMenuCheckboxItem
            checked={trace.status === 'EXPLOITABLE'}
            disabled={declareExploitability.isPending}
            onCheckedChange={(checked) => checked && declareExploitability.mutate({ id: trace.id, exploitable: true })}
            className={itemClassName}
          >
            {t('trace.exploitability.exploitable')}
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={trace.status === 'NOT_EXPLOITABLE'}
            disabled={declareExploitability.isPending}
            onCheckedChange={(checked) => checked && declareExploitability.mutate({ id: trace.id, exploitable: false })}
            className={itemClassName}
          >
            {t('trace.exploitability.notExploitable')}
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={!!trace.notIdentified}
            disabled={isNotIdentifiedPending}
            aria-label={notIdentifiedAriaLabel}
            onCheckedChange={toggleNotIdentified}
            className={itemClassName}
          >
            {t('trace.exploitability.notIdentified')}
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
