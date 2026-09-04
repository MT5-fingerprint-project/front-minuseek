import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { LayerAPI } from '@/features/biometric-image/services/LayerAPI.services'
import { minutiaPairKeys } from '@/features/investigation-case/hooks/minutiaPairKeys'
import type { CreateLayerInput, UpdateLayerInput } from '@/features/biometric-image/types/layer'

export const layerKeys = {
  all: ['layers'] as const,
  list: (fingerprintId: string) => [...layerKeys.all, fingerprintId] as const,
}

/** Une minutie appariée engage l'autre empreinte : n'invalider que son propre fingerprint
 *  laisserait le canevas d'en face afficher un badge de paire disparue. */
function invalidateLayersAndPairs(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: layerKeys.all })
  queryClient.invalidateQueries({ queryKey: minutiaPairKeys.all })
}

export function useLayers(fingerprintId: string | undefined) {
  return useQuery({
    queryKey: layerKeys.list(fingerprintId ?? ''),
    queryFn: () => LayerAPI.getAll(fingerprintId!),
    enabled: !!fingerprintId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateLayer() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (input: CreateLayerInput) => LayerAPI.create(input),
    onSuccess: () => invalidateLayersAndPairs(queryClient),
    onError: () => toast.error(t('biometricImage.layers.createError')),
  })
}

export function useUpdateLayer() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLayerInput }) =>
      LayerAPI.update(id, input),
    onSuccess: () => invalidateLayersAndPairs(queryClient),
    onError: () => toast.error(t('biometricImage.layers.updateError')),
  })
}

export function useDeleteLayer() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => LayerAPI.remove(id),
    onSuccess: () => invalidateLayersAndPairs(queryClient),
    onError: () => toast.error(t('biometricImage.layers.deleteError')),
  })
}
