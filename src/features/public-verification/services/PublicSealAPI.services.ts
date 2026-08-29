import axios, { isAxiosError } from 'axios'
import { API_URL } from '@/features/shared/constants/global.constants'
import type { SealLookup } from '@/features/public-verification/types/seal'

const publicClient = axios.create({ baseURL: API_URL })

export const PublicSealAPI = {
  find: (slug: string, sha256: string): Promise<SealLookup> =>
    publicClient
      .get<SealLookup>(`/public/${slug}/seals/${sha256}`)
      .then((res) => res.data)
      .catch((error: unknown) => {
        if (isAxiosError(error) && error.response?.status === 404) {
          return { known: false } as SealLookup
        }
        throw error
      }),
}
