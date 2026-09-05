import { Pause, Play, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/features/shared/lib/utils'
import type { PlaybackSpeed, PlaybackStatus } from '@/features/investigation-case/hooks/useConcordancePlayback'

const SPEEDS: PlaybackSpeed[] = [0.5, 1, 2]

type DisabledReason = 'noPairs' | 'detached' | 'pairingActive' | null

type ConcordancePlaybackControlsProps = {
  status: PlaybackStatus
  speed: PlaybackSpeed
  revealedCount: number
  pairCount: number
  disabledReason?: DisabledReason
  onPlay: () => void
  onToggle: () => void
  onSpeedChange: (speed: PlaybackSpeed) => void
  onStop: () => void
}

/** Contrôles de la démonstration des concordances (L7-3) : lecture, pause/reprise, vitesse, compteur. */
export default function ConcordancePlaybackControls({
  status,
  speed,
  revealedCount,
  pairCount,
  disabledReason = null,
  onPlay,
  onToggle,
  onSpeedChange,
  onStop,
}: ConcordancePlaybackControlsProps) {
  const { t } = useTranslation()

  if (status === 'idle') {
    const disabled = disabledReason !== null
    const title =
      disabledReason === 'noPairs'
        ? t('investigationCase.comparison.concordanceButtonDisabledNoPairs')
        : disabledReason === 'detached'
          ? t('investigationCase.comparison.concordanceButtonDisabledDetached')
          : disabledReason === 'pairingActive'
            ? t('investigationCase.comparison.concordanceButtonDisabledPairingActive')
            : t('investigationCase.comparison.concordanceButton')

    return (
      <button
        type="button"
        onClick={onPlay}
        disabled={disabled}
        title={title}
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium text-white shadow-sm ring-[3px] ring-white transition-colors',
          !disabled && 'bg-grey-medium-2 hover:bg-grey-dark',
          disabled && 'cursor-not-allowed bg-grey-medium-1'
        )}
      >
        <span className={cn('text-sm leading-none', disabled && 'opacity-70')}>
          {t('investigationCase.comparison.concordanceButtonLabel')}
        </span>
        <Play size={16} className={cn(disabled && 'opacity-70')} aria-hidden />
      </button>
    )
  }

  const isPlaying = status === 'playing'

  return (
    <div className="flex items-center gap-2 rounded-full bg-grey-dark px-2 py-1 shadow-sm ring-[5px] ring-white">
      <button
        type="button"
        onClick={onToggle}
        title={t(isPlaying ? 'investigationCase.comparison.concordancePauseButton' : 'investigationCase.comparison.concordanceResumeButton')}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-medium-1 text-white"
      >
        {isPlaying ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
      </button>

      <div className="flex items-center rounded-full bg-white/10 p-0.5" title={t('investigationCase.comparison.concordanceSpeedTitle')}>
        {SPEEDS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSpeedChange(option)}
            aria-pressed={speed === option}
            title={t('investigationCase.comparison.concordanceSpeedOption', { speed: option })}
            className={cn(
              'rounded-full px-2 py-1 text-sm font-medium transition-colors',
              speed === option ? 'bg-white text-grey-dark' : 'text-white/80 hover:text-white'
            )}
          >
            {option}x
          </button>
        ))}
      </div>

      <span className="rounded-full bg-white px-2 py-1 text-sm font-medium text-grey-dark">
        {t('investigationCase.comparison.concordanceCounter', { current: revealedCount, total: pairCount })}
      </span>

      <button
        type="button"
        onClick={onStop}
        title={t('investigationCase.comparison.concordanceStopButton')}
        className="flex h-7 w-7 items-center justify-center rounded-full text-white hover:bg-white/10"
      >
        <X size={16} aria-hidden />
      </button>
    </div>
  )
}
