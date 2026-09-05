import { Skeleton } from '@/features/shared/ui/skeleton'

export default function OperatorHomeSkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="h-4 w-64 rounded-sm" />
      <Skeleton className="mt-3 h-11 w-[680px] max-w-full rounded-sm" />
      <Skeleton className="mt-2 h-11 w-[520px] max-w-full rounded-sm" />
      <Skeleton className="mt-6 h-20 w-full max-w-[1120px] rounded-none" />
      <div className="mt-8 flex flex-wrap gap-18">
        <Skeleton className="h-8 w-80 rounded-sm" />
        <Skeleton className="h-8 w-80 rounded-sm" />
      </div>
      <Skeleton className="mt-8 h-4 w-40 rounded-sm" />
      <Skeleton className="mt-2.5 h-[308px] w-full rounded-sm" />
    </div>
  )
}
