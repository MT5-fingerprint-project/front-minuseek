import { useQuery } from '@tanstack/react-query'
import { MyWorkAPI } from '@/features/operator-home/services/MyWorkAPI.services'

export const myWorkKeys = {
  all: ['my-work'] as const,
  mine: () => [...myWorkKeys.all, 'mine'] as const,
}

export function useMyWork(enabled = true) {
  return useQuery({
    queryKey: myWorkKeys.mine(),
    queryFn: () => MyWorkAPI.getMine(),
    enabled,
  })
}
