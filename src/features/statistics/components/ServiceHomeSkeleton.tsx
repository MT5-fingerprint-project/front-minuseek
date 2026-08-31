import { Skeleton } from '@/features/shared/ui/skeleton'

export default function ServiceHomeSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-32 rounded-sm" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-26 rounded-sm" />
        <Skeleton className="h-26 rounded-sm" />
        <Skeleton className="h-26 rounded-sm" />
      </div>
      <Skeleton className="h-36 rounded-sm" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-sm" />
        <Skeleton className="h-80 rounded-sm" />
      </div>
      <Skeleton className="h-80 rounded-sm" />
    </div>
  )
}
