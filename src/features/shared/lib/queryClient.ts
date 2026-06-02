import { QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import i18n from '@/features/shared/lib/i18n'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: () => {
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
