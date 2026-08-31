import { useTranslation } from 'react-i18next'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/features/shared/ui/table'
import { cn } from '@/features/shared/lib/utils'

type FiguresDisclosureProps = {
  headers: string[]
  rows: (string | number)[][]
  numericColumns: number[]
}

export default function FiguresDisclosure({ headers, rows, numericColumns }: FiguresDisclosureProps) {
  const { t } = useTranslation()

  return (
    <details className="mt-4 border-t border-grey-light-2 pt-2.5">
      <summary className="cursor-pointer text-xs text-muted-foreground">{t('statistics.figures.show')}</summary>
      <Table className="mt-2.5 text-xs">
        <TableHeader>
          <TableRow>
            {headers.map((header, columnIndex) => (
              <TableHead
                key={header}
                className={cn('px-0 pr-2.5 py-1.5 normal-case tracking-normal', {
                  'text-right tabular-nums': numericColumns.includes(columnIndex),
                })}
              >
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cellValue, columnIndex) => (
                <TableCell
                  key={headers[columnIndex]}
                  className={cn('px-0 pr-2.5 py-1.5', {
                    'text-right tabular-nums': numericColumns.includes(columnIndex),
                  })}
                >
                  {cellValue}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </details>
  )
}
