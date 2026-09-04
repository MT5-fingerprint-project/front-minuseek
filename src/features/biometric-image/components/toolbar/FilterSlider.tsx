import { useState } from 'react'
import { Slider as SliderPrimitive } from 'radix-ui'
import { cn } from '@/features/shared/lib/utils'

type FilterSliderProps = {
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  origin?: 'center' | 'left'
  commitOnRelease?: boolean
  onChange: (value: number) => void
}

export default function FilterSlider({
  value = 0,
  min = -100,
  max = 100,
  step = 1,
  unit = '%',
  origin = 'center',
  commitOnRelease = false,
  onChange,
}: FilterSliderProps) {
  // Marquée par la valeur d'où elle part : quand le parent applique celle du relâchement,
  // le repère ne correspond plus et l'affichage repasse sur la valeur du parent.
  const [dragged, setDragged] = useState<{ from: number; value: number } | null>(null)
  const displayedValue = dragged?.from === value ? dragged.value : value

  const range = max - min

  const thumbPct = ((displayedValue - min) / range) * 100
  const centerPct = ((0 - min) / range) * 100

  const fillLeft = origin === 'center' ? Math.min(thumbPct, centerPct) : 0
  const fillWidth = origin === 'center' ? Math.abs(thumbPct - centerPct) : thumbPct

  return (
    <div className="flex items-center gap-3">
      <SliderPrimitive.Root
        min={min}
        max={max}
        step={step}
        value={[displayedValue]}
        onValueChange={([next]) => {
          if (!commitOnRelease) {
            onChange(next)
            return
          }
          setDragged({ from: value, value: next })
        }}
        onValueCommit={([next]) => {
          if (!commitOnRelease) return
          setDragged(null)
          onChange(next)
        }}
        className="relative flex flex-1 touch-none items-center select-none"
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow rounded-full bg-grey-medium-1 overflow-hidden">
          <SliderPrimitive.Range className="hidden" />
          <div
            className="absolute h-full bg-blue-medium-1 rounded-full"
            style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            'block h-5 w-5 rounded-full bg-white border-2 border-blue-medium-1 shadow',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
          )}
        />
      </SliderPrimitive.Root>
      <span className="w-12 text-right text-sm tabular-nums text-white">
        {displayedValue}{unit}
      </span>
    </div>
  )
}
