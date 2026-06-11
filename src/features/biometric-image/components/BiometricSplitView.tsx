import { useTranslation } from 'react-i18next'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/features/shared/ui/resizable'
import type { BiometricImage } from '@/features/biometric-image/types/biometricImage'

type BiometricSplitViewProps = {
  traceImage: BiometricImage | undefined
  referencePrintImage: BiometricImage | undefined
}

export default function BiometricSplitView({ traceImage, referencePrintImage }: BiometricSplitViewProps) {
  const { t } = useTranslation()

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="min-h-[500px] flex-1 rounded-lg border bg-white"
    >
      <ResizablePanel defaultSize={50} minSize={20}>
        <BiometricImagePreview
          image={traceImage}
          placeholder={t('investigationCase.comparison.selectTrace')}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={20}>
        <BiometricImagePreview
          image={referencePrintImage}
          placeholder={t('investigationCase.comparison.selectReferencePrint')}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

type BiometricImagePreviewProps = {
  image: BiometricImage | undefined
  placeholder: string
}

function BiometricImagePreview({ image, placeholder }: BiometricImagePreviewProps) {
  if (!image) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
        {placeholder}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6">
      <img src={image.url} alt={image.fileName} className="max-h-full max-w-full object-contain" />
      <span className="text-xs text-muted-foreground">{image.fileName}</span>
    </div>
  )
}
