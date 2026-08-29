import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { Button } from '@/features/shared/ui/button'

type SealDropZoneProps = {
  isPending: boolean
  fileName: string | null
  onFile: (file: File) => void
  onReset: () => void
}

const INPUT_ID = 'seal-file'

export default function SealDropZone({ isPending, fileName, onFile, onReset }: SealDropZoneProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isOver, setIsOver] = useState(false)

  function take(files: FileList | null) {
    const file = files?.[0]
    if (file) onFile(file)
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`flex flex-col items-center gap-2 rounded-sm border-2 border-dashed px-6 py-10 text-center ${
          isOver ? 'border-foreground bg-muted' : 'border-grey-light-2'
        }`}
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
        <Icon name="import" size={24} />
        <label htmlFor={INPUT_ID} className="cursor-pointer text-sm font-medium underline">
          {isOver ? t('publicVerification.dropZone.hovered') : t('publicVerification.dropZone.label')}
        </label>
        <input
          id={INPUT_ID}
          ref={inputRef}
          type="file"
          className="sr-only"
          disabled={isPending}
          onChange={(event) => {
            take(event.target.files)
            event.target.value = ''
          }}
        />
        <p className="text-xs text-muted-foreground">{t('publicVerification.dropZone.hint')}</p>
        {fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}
      </div>

      {fileName && (
        <Button variant="grey" size="small" className="self-start" onClick={onReset}>
          {t('publicVerification.another')}
        </Button>
      )}
    </div>
  )
}
