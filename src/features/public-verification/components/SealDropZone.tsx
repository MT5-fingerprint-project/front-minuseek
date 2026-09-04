import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { Button } from '@/features/shared/ui/button'
import { Spinner } from '@/features/shared/ui/spinner'
import { cn } from '@/features/shared/lib/utils'

type SealDropZoneProps = {
  isPending: boolean
  fileName: string | null
  onFile: (file: File) => void
  onReset: () => void
}

const INPUT_ID = 'seal-file'

export default function SealDropZone({ isPending, fileName, onFile, onReset }: SealDropZoneProps) {
  const { t } = useTranslation()
  const [isOver, setIsOver] = useState(false)

  function take(files: FileList | null) {
    const file = files?.[0]
    if (file && !isPending) onFile(file)
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        aria-busy={isPending}
        className={cn(
          'flex flex-col items-center gap-3 rounded-sm border-2 border-dashed px-6 py-10 text-center transition-colors',
          'focus-within:border-blue-medium-1 focus-within:ring-3 focus-within:ring-blue-light-3/40',
          isOver ? 'border-blue-medium-1 bg-blue-light-1' : 'border-grey-light-2 bg-grey-light-1/50'
        )}
        onDragOver={(event) => {
          event.preventDefault()
          setIsOver(true)
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsOver(false)
          take(event.dataTransfer.files)
        }}
      >
        <span
          className={cn(
            'flex size-12 items-center justify-center rounded-full text-blue-medium-2',
            isOver ? 'bg-white' : 'bg-blue-light-1'
          )}
        >
          {isPending ? <Spinner aria-hidden className="size-5" /> : <Icon name="import" size={24} color="currentColor" />}
        </span>

        <label
          htmlFor={INPUT_ID}
          className="cursor-pointer text-sm font-medium text-blue-dark-2 underline underline-offset-4 transition-colors hover:text-blue-medium-1"
        >
          {isOver ? t('publicVerification.dropZone.hovered') : t('publicVerification.dropZone.label')}
        </label>
        <input
          id={INPUT_ID}
          type="file"
          className="sr-only"
          disabled={isPending}
          onChange={(event) => {
            take(event.target.files)
            event.target.value = ''
          }}
        />

        <div className="flex flex-col gap-0.5 text-xs text-grey-dark">
          <p>{t('publicVerification.dropZone.hint')}</p>
          <p>{t('publicVerification.dropZone.limit')}</p>
        </div>

        {fileName && (
          <p className="max-w-full truncate rounded-3xl bg-white px-3 py-1 text-xs font-medium text-blue-dark-2">
            {fileName}
          </p>
        )}
      </div>

      {fileName && (
        <Button variant="grey" size="small" className="self-center" onClick={onReset}>
          {t('publicVerification.another')}
        </Button>
      )}
    </div>
  )
}
