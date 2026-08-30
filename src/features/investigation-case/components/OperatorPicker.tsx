import { useState, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxNotice,
  ComboboxPopup,
  ComboboxPortal,
  ComboboxPositioner,
  ComboboxStatus,
  ComboboxTrigger,
  ComboboxValue,
} from '@/features/shared/ui/combobox'
import { useDebouncedValue } from '@/features/shared/hooks/useDebouncedValue'
import { useServiceUsers } from '@/features/users/hooks/useServiceUsers'
import { NO_SERVICE_USERS_FILTER } from '@/features/users/types/serviceUser'
import type { UserRole } from '@/features/shared/types/user'
import { caseUserNameOf } from '@/features/investigation-case/types/investigationCase'

const CANDIDATES_PER_SEARCH = 20

export type OperatorCandidate = {
  id: string
  name: string
  role?: UserRole
}

type OperatorPickerProps = {
  id?: string
  ariaLabel: string
  selected: OperatorCandidate | null
  excludedIds?: string[]
  container: RefObject<HTMLElement | null>
  onSelect: (candidate: OperatorCandidate | null) => void
}

export default function OperatorPicker({
  id,
  ariaLabel,
  selected,
  excludedIds = [],
  container,
  onSelect,
}: OperatorPickerProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search.trim())

  const candidatesQuery = useServiceUsers(
    {
      ...NO_SERVICE_USERS_FILTER,
      search: debouncedSearch,
      status: 'ACTIVE',
      page: 1,
      limit: CANDIDATES_PER_SEARCH,
    },
    isOpen
  )

  const candidates: OperatorCandidate[] = (candidatesQuery.data?.data ?? [])
    .filter((account) => !excludedIds.includes(account.id))
    .map((account) => ({ id: account.id, name: caseUserNameOf(account), role: account.role }))

  const isTruncated = candidatesQuery.data?.meta.hasNextPage ?? false

  function emptyMessage(): string | null {
    if (candidatesQuery.isError) return t('investigationCase.form.fields.operator.unavailable')
    if (candidatesQuery.isPending) return null
    if (debouncedSearch) return t('investigationCase.form.fields.operator.noResult')
    return t('investigationCase.form.fields.operator.noCandidate')
  }

  return (
    <Combobox<OperatorCandidate, false>
      items={candidates}
      filter={null}
      value={selected}
      onValueChange={(candidate) => onSelect(candidate)}
      inputValue={search}
      onInputValueChange={(next) => setSearch(next)}
      open={isOpen}
      onOpenChange={(next) => setIsOpen(next)}
      itemToStringLabel={(candidate) => candidate.name}
      itemToStringValue={(candidate) => candidate.id}
      isItemEqualToValue={(candidate, value) => candidate.id === value.id}
      autoHighlight
    >
      <ComboboxTrigger
        id={id}
        aria-label={ariaLabel}
        className="h-11 w-full rounded-xs border-grey-light-2 bg-white"
      >
        <ComboboxValue placeholder={t('investigationCase.form.fields.operator.unassigned')} />
      </ComboboxTrigger>

      <ComboboxPortal container={container}>
        <ComboboxPositioner>
          <ComboboxPopup>
            <ComboboxInput
              placeholder={t('investigationCase.form.fields.operator.searchPlaceholder')}
              aria-label={t('investigationCase.form.fields.operator.searchLabel')}
            />
            <ComboboxStatus>
              {candidatesQuery.isPending ? t('investigationCase.form.fields.operator.loading') : null}
            </ComboboxStatus>
            <ComboboxEmpty className={candidatesQuery.isError ? 'text-destructive' : undefined}>
              {emptyMessage()}
            </ComboboxEmpty>
            <ComboboxList>
              {(candidate: OperatorCandidate) => (
                <ComboboxItem key={candidate.id} value={candidate}>
                  <span className="truncate">{candidate.name}</span>
                  {candidate.role && (
                    <span className="text-xs text-muted-foreground">{t(`users.roles.${candidate.role}`)}</span>
                  )}
                </ComboboxItem>
              )}
            </ComboboxList>
            {isTruncated && (
              <ComboboxNotice>
                {t('investigationCase.form.fields.operator.moreResults', { count: CANDIDATES_PER_SEARCH })}
              </ComboboxNotice>
            )}
          </ComboboxPopup>
        </ComboboxPositioner>
      </ComboboxPortal>
    </Combobox>
  )
}
