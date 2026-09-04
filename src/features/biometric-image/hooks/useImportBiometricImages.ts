import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { BiometricImageAPI } from '@/features/biometric-image/services/BiometricImageAPI.services'
import { biometricImageKeys } from '@/features/biometric-image/hooks/useBiometricImages'
import type { BiometricImage, BiometricImageType } from '@/features/biometric-image/types/biometricImage'

export type ImportProgress = { current: number; total: number }

export type BiometricImageImport = {
  start: (files: File[]) => void
  isImporting: boolean
  progress: ImportProgress | null
}

type ImportOutcome = {
  firstImported: BiometricImage | null
  importedCount: number
  failedNames: string[]
}

type UseImportBiometricImagesOptions = {
  onImported?: (image: BiometricImage) => void
}

export function useImportBiometricImages(
  type: BiometricImageType,
  caseId: string,
  options?: UseImportBiometricImagesOptions
): BiometricImageImport {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [progress, setProgress] = useState<ImportProgress | null>(null)

  const importImages = useMutation({
    mutationFn: async (files: File[]): Promise<ImportOutcome> => {
      let firstImported: BiometricImage | null = null
      const failedNames: string[] = []

      for (const [index, file] of files.entries()) {
        setProgress({ current: index + 1, total: files.length })
        try {
          const image = await BiometricImageAPI.upload(type, { caseId, file })
          firstImported ??= image
          queryClient.invalidateQueries({ queryKey: biometricImageKeys.list(type, caseId) })
        } catch {
          failedNames.push(file.name)
        }
      }

      return { firstImported, importedCount: files.length - failedNames.length, failedNames }
    },
    onSettled: () => setProgress(null),
    onSuccess: ({ firstImported, importedCount, failedNames }) => {
      if (importedCount > 0) toast.success(t('biometricImage.import.imported', { count: importedCount }))
      if (failedNames.length > 0)
        toast.error(
          t('biometricImage.import.failed', { count: failedNames.length, files: failedNames.join(', ') })
        )
      if (firstImported) options?.onImported?.(firstImported)
    },
  })

  const start = (files: File[]) => {
    if (files.length === 0) return
    if (importImages.isPending) {
      toast.info(t('biometricImage.import.busy'))
      return
    }
    importImages.mutate(files)
  }

  return { start, isImporting: importImages.isPending, progress }
}
