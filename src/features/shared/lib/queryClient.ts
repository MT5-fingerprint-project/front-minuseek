import { QueryCache, QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import i18n from '@/features/shared/lib/i18n'

function isNotFound(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 404
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.handlesNotFound === true && isNotFound(error)) return
      toast.error(i18n.t('common.errors.loadFailed'))
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
