import { useTranslation } from 'react-i18next'
import { Icon } from '@/features/shared/icons'
import { Button } from '@/features/shared/ui/button'
import type { PaginationMeta } from '@/features/shared/types/api'

type ServiceUsersPaginationProps = {
  meta: PaginationMeta
  isFetching: boolean
  onPreviousPage: () => void
  onNextPage: () => void
}

export default function ServiceUsersPagination({
  meta,
  isFetching,
  onPreviousPage,
  onNextPage,
}: ServiceUsersPaginationProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between gap-4 border-t border-grey-light-2 px-4 py-3">
      <span className="text-sm text-muted-foreground">
        {t('users.pagination.total', { count: meta.itemCount })}
      </span>
      <div className="flex items-center gap-3">
        <Button variant="grey" size="small" disabled={!meta.hasPreviousPage || isFetching} onClick={onPreviousPage}>
          <Icon name="chevronLeft" size={12} data-icon="inline-start" color="currentColor" />
          {t('users.pagination.previous')}
        </Button>
        <span className="text-xs text-muted-foreground">
          {t('users.pagination.position', { page: meta.page, pageCount: Math.max(meta.pageCount, 1) })}
        </span>
        <Button variant="grey" size="small" disabled={!meta.hasNextPage || isFetching} onClick={onNextPage}>
          {t('users.pagination.next')}
          <Icon name="chevronRight" size={12} data-icon="inline-end" color="currentColor" />
        </Button>
      </div>
    </div>
  )
}
