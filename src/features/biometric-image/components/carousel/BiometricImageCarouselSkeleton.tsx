import { Skeleton } from '@/features/shared/ui/skeleton'

export default function BiometricImageCarouselSkeleton() {
  return (
    <div className="flex flex-1 items-center gap-2 overflow-hidden">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-[107px] w-[73px] shrink-0 rounded" />
      ))}
    </div>
  )
}
