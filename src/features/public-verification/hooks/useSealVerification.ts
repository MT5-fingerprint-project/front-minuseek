import { useMutation } from '@tanstack/react-query'
import { PublicSealAPI } from '@/features/public-verification/services/PublicSealAPI.services'
import { hashFileSha256 } from '@/features/public-verification/lib/sha256File'
import type { SealVerification } from '@/features/public-verification/types/seal'

export function useSealVerification(slug: string) {
  return useMutation<SealVerification, Error, File>({
    mutationFn: async (file: File) => {
      const sha256 = await hashFileSha256(file)
      return { sha256, lookup: await PublicSealAPI.find(slug, sha256) }
    },
  })
}
