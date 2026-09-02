import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { BiometricImageAPI, type UploadInput } from '@/features/biometric-image/services/BiometricImageAPI.services'
import type {
  BiometricImage,
  BiometricImageType,
  WithdrawalMotive,
} from '@/features/biometric-image/types/biometricImage'
import type { TraceDescriptionInput } from '@/features/biometric-image/types/trace'

export const biometricImageKeys = {
  all: ['biometric-images'] as const,
  list: (type: BiometricImageType, caseId: string) =>
    [...biometricImageKeys.all, type, caseId] as const,
  withdrawn: (type: BiometricImageType, caseId: string) =>
    [...biometricImageKeys.all, type, caseId, 'withdrawn'] as const,
  trace: (traceId: string) => [...biometricImageKeys.all, 'trace', traceId] as const,
}

export function useBiometricImages(type: BiometricImageType, caseId: string) {
  return useQuery({
    queryKey: biometricImageKeys.list(type, caseId),
    queryFn: () => BiometricImageAPI.getAll(type, caseId),
    enabled: !!caseId,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

export function useTrace(traceId: string) {
  return useQuery({
    queryKey: biometricImageKeys.trace(traceId),
    queryFn: () => BiometricImageAPI.getTrace(traceId),
    enabled: !!traceId,
    meta: { handlesNotFound: true },
  })
}

export function useDescribeTrace(caseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, description }: { id: string; description: TraceDescriptionInput }) =>
      BiometricImageAPI.describeTrace(id, description),
    onSuccess: (trace) => {
      queryClient.invalidateQueries({ queryKey: biometricImageKeys.list('traces', caseId) })
      queryClient.invalidateQueries({ queryKey: biometricImageKeys.trace(trace.id) })
      toast.success(t('trace.description.success'))
    },
    onError: () => {
      toast.error(t('trace.description.error'))
    },
  })
}

export function useDeclareExploitability(caseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, exploitable }: { id: string; exploitable: boolean }) =>
      BiometricImageAPI.declareExploitability(id, exploitable),
    onSuccess: (trace) => {
      queryClient.invalidateQueries({ queryKey: biometricImageKeys.list('traces', caseId) })
      queryClient.invalidateQueries({ queryKey: biometricImageKeys.trace(trace.id) })
      toast.success(t('trace.exploitability.success'))
    },
    onError: () => {
      toast.error(t('trace.exploitability.error'))
    },
  })
}

export function useDeclareNotIdentified(caseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => BiometricImageAPI.declareNotIdentified(id),
    onSuccess: (trace) => {
      queryClient.invalidateQueries({ queryKey: biometricImageKeys.list('traces', caseId) })
      queryClient.invalidateQueries({ queryKey: biometricImageKeys.trace(trace.id) })
      toast.success(t('trace.exploitability.notIdentifiedSuccess'))
    },
    onError: () => {
      toast.error(t('trace.exploitability.notIdentifiedError'))
    },
  })
}

export function useWithdrawNotIdentified(caseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => BiometricImageAPI.withdrawNotIdentified(id),
    onSuccess: (trace) => {
      queryClient.invalidateQueries({ queryKey: biometricImageKeys.list('traces', caseId) })
      queryClient.invalidateQueries({ queryKey: biometricImageKeys.trace(trace.id) })
      toast.success(t('trace.exploitability.withdrawNotIdentifiedSuccess'))
    },
    onError: () => {
      toast.error(t('trace.exploitability.withdrawNotIdentifiedError'))
    },
  })
}

function invalidateTrace(
  queryClient: ReturnType<typeof useQueryClient>,
  caseId: string,
  traceId: string,
) {
  queryClient.invalidateQueries({ queryKey: biometricImageKeys.list('traces', caseId) })
  queryClient.invalidateQueries({ queryKey: biometricImageKeys.trace(traceId) })
}

export function useAttachTraceLocationPhoto(caseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ traceId, file }: { traceId: string; file: File }) =>
      BiometricImageAPI.attachLocationPhoto(traceId, file),
    onSuccess: (_data, { traceId }) => {
      invalidateTrace(queryClient, caseId, traceId)
      toast.success(t('trace.locationPhoto.attachSuccess'))
    },
    onError: (error) => {
      const isAlreadyAttached = isAxiosError(error) && error.response?.status === 409
      toast.error(
        t(isAlreadyAttached ? 'trace.locationPhoto.alreadyAttached' : 'trace.locationPhoto.attachError')
      )
    },
  })
}

export function useRemoveTraceLocationPhoto(caseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      traceId,
      motive,
      motiveDetail,
    }: {
      traceId: string
      motive: WithdrawalMotive
      motiveDetail?: string
    }) => BiometricImageAPI.removeLocationPhoto(traceId, motive, motiveDetail),
    onSuccess: (_data, { traceId }) => {
      invalidateTrace(queryClient, caseId, traceId)
      toast.success(t('trace.locationPhoto.removeSuccess'))
    },
    onError: () => {
      toast.error(t('trace.locationPhoto.removeError'))
    },
  })
}

export function useWithdrawnBiometricImages(type: BiometricImageType, caseId: string) {
  return useQuery({
    queryKey: biometricImageKeys.withdrawn(type, caseId),
    queryFn: () => BiometricImageAPI.getAll(type, caseId, { withdrawn: true }),
    enabled: !!caseId,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

function invalidateBothLists(
  queryClient: ReturnType<typeof useQueryClient>,
  type: BiometricImageType,
  caseId: string,
) {
  queryClient.invalidateQueries({ queryKey: biometricImageKeys.list(type, caseId) })
  queryClient.invalidateQueries({ queryKey: biometricImageKeys.withdrawn(type, caseId) })
}

export function useWithdrawBiometricImage(type: BiometricImageType, caseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({
      id,
      motive,
      motiveDetail,
    }: {
      id: string
      motive: WithdrawalMotive
      motiveDetail?: string
    }) => BiometricImageAPI.withdraw(type, id, motive, motiveDetail),
    onSuccess: () => {
      invalidateBothLists(queryClient, type, caseId)
      toast.success(t('biometricImage.withdraw.success'))
    },
    onError: () => {
      toast.error(t('biometricImage.withdraw.error'))
    },
  })
}

export function useRestoreBiometricImage(type: BiometricImageType, caseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => BiometricImageAPI.restore(type, id),
    onSuccess: () => {
      invalidateBothLists(queryClient, type, caseId)
      toast.success(t('biometricImage.restore.success'))
    },
    onError: () => {
      toast.error(t('biometricImage.restore.error'))
    },
  })
}

export function useCalibrateBiometricImage(type: BiometricImageType, caseId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, resolutionDpi }: { id: string; resolutionDpi: number }) =>
      BiometricImageAPI.calibrate(type, id, resolutionDpi),
    onSuccess: (_data, variables) => {
      // Écrit la résolution dans le cache avant l'invalidation : la barre d'échelle
      // apparaît sans attendre l'aller-retour réseau de l'invalidation.
      queryClient.setQueryData<BiometricImage[]>(biometricImageKeys.list(type, caseId), (images) =>
        images?.map((image) =>
          image.id === variables.id ? { ...image, resolutionDpi: variables.resolutionDpi } : image,
        ),
      )
      queryClient.invalidateQueries({ queryKey: biometricImageKeys.list(type, caseId) })
      toast.success(t('biometricImage.calibration.success'))
    },
    onError: () => {
      toast.error(t('biometricImage.calibration.error'))
    },
  })
}

type UseUploadBiometricImageOptions = {
  onSuccess?: (image: import('@/features/biometric-image/types/biometricImage').BiometricImage) => void
}

export function useUploadBiometricImage(type: BiometricImageType, options?: UseUploadBiometricImageOptions) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (input: UploadInput) => BiometricImageAPI.upload(type, input),
    onSuccess: (image, variables) => {
      queryClient.invalidateQueries({ queryKey: biometricImageKeys.list(type, variables.caseId) })
      toast.success(t('biometricImage.upload.success'))
      options?.onSuccess?.(image)
    },
    onError: () => {
      toast.error(t('biometricImage.upload.error'))
    },
  })
}

export async function uploadImagesOneByOne(
  upload: ReturnType<typeof useUploadBiometricImage>,
  caseId: string,
  files: File[],
) {
  for (const file of files) {
    await upload.mutateAsync({ caseId, file }).catch(() => undefined)
  }
}
