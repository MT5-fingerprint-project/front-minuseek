import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { LayerAPI } from '@/features/biometric-image/services/LayerAPI.services'
import type { CreateLayerInput, UpdateLayerInput } from '@/features/biometric-image/types/layer'

export const layerKeys = {
  all: ['layers'] as const,
  list: (fingerprintId: string) => [...layerKeys.all, fingerprintId] as const,
}

export function useLayers(fingerprintId: string | undefined) {
  return useQuery({
    queryKey: layerKeys.list(fingerprintId ?? ''),
    queryFn: () => LayerAPI.getAll(fingerprintId!),
    enabled: !!fingerprintId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateLayer(fingerprintId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (input: CreateLayerInput) => LayerAPI.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: layerKeys.list(fingerprintId) })
    },
    onError: () => toast.error(t('biometricImage.layers.createError')),
  })
}

export function useUpdateLayer(fingerprintId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLayerInput }) =>
      LayerAPI.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: layerKeys.list(fingerprintId) })
    },
    onError: () => toast.error(t('biometricImage.layers.updateError')),
  })
}

export function useDeleteLayer(fingerprintId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => LayerAPI.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: layerKeys.list(fingerprintId) })
    },
    onError: () => toast.error(t('biometricImage.layers.deleteError')),
  })
}
