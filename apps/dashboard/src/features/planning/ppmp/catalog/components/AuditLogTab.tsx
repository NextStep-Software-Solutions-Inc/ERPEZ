/**
 * AuditLogTab
 * Tabular change history for a catalog item (TanStack Table).
 */

import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAuditLogTab } from '../hooks/useDetailPanelTabs'
import { formatDateTime, formatAuditAction } from '../utils/catalogFormatters'
import type { AuditLogEntry, AuditLogAction } from '../types'

const colHelper = createColumnHelper<AuditLogEntry>()

const ACTION_STYLES: Record<AuditLogAction, string> = {
  create:
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400',
  update:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400',
  deactivate: 'bg-gray-50 text-gray-500 border-gray-200',
  reactivate:
    'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400',
  bulk_adjust:
    'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400',
  duplicate:
    'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-400',
}

const AUDIT_COLUMNS = [
  colHelper.accessor('changedAt', {
    id: 'changedAt',
    header: 'When',
    cell: (info) => (
      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
        {formatDateTime(info.getValue())}
      </span>
    ),
    size: 130,
  }),
  colHelper.accessor('action', {
    id: 'action',
    header: 'Action',
    cell: (info) => (
      <Badge
        variant="outline"
        className={cn('text-[10px] capitalize', ACTION_STYLES[info.getValue()])}
      >
        {formatAuditAction(info.getValue())}
      </Badge>
    ),
    size: 100,
  }),
  colHelper.accessor('fieldChanged', {
    id: 'fieldChanged',
    header: 'Field',
    cell: (info) =>
      info.getValue() ? (
        <span className="font-mono text-[11px]">{info.getValue()}</span>
      ) : (
        <span className="text-muted-foreground text-[11px] italic">—</span>
      ),
    size: 110,
  }),
  colHelper.accessor('oldValue', {
    id: 'oldValue',
    header: 'From',
    cell: (info) =>
      info.getValue() ? (
        <span className="text-[11px] text-muted-foreground line-through">
          {info.getValue()}
        </span>
      ) : (
        <span className="text-muted-foreground text-[11px] italic">—</span>
      ),
    size: 90,
  }),
  colHelper.accessor('newValue', {
    id: 'newValue',
    header: 'To',
    cell: (info) =>
      info.getValue() ? (
        <span className="text-[11px]">{info.getValue()}</span>
      ) : (
        <span className="text-muted-foreground text-[11px] italic">—</span>
      ),
    size: 90,
  }),
  colHelper.accessor('changedBy', {
    id: 'changedBy',
    header: 'By',
    cell: (info) => (
      <span className="text-[11px] text-muted-foreground">
        {info.getValue()}
      </span>
    ),
    size: 110,
  }),
]

export function AuditLogTab() {
  const { data: entries, isLoading } = useAuditLogTab()

  const data = useMemo(() => {
    if (!entries) return []
    return [...entries].sort(
      (a, b) =>
        new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
    )
  }, [entries])

  const table = useReactTable({
    data,
    columns: AUDIT_COLUMNS,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic text-center py-8">
        No audit records found.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border pb-4">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="bg-muted/30 hover:bg-muted/30">
              {hg.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-[10px] uppercase tracking-wide h-8 px-2"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="hover:bg-muted/30">
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="py-2 px-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
