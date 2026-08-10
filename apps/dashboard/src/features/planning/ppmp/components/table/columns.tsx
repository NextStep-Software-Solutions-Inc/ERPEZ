/**
 * components/table/columns.tsx
 * Column definitions for PPMP list table
 */

import { Badge } from '@/components/ui/badge'
import type { ColumnDef, TableMeta } from '@tanstack/react-table'

import { PpmpStatusBadge } from '../../components'
import { PpmpActions } from './PpmpActions'
import { formatCurrency } from '../../lib/ppmpUtils'
import { PPMP } from '../../types'

export const Column: ColumnDef<PPMP>[] = [
  {
    accessorKey: 'documentName',
    header: 'PPMP Name',
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="font-medium text-sm text-foreground leading-tight truncate max-w-xs">
            {row.getValue('documentName')}
          </div>
          {row.original.isMasterOffice && (
            <Badge variant="soft" className="text-[10px] shrink-0">
              Master Office
            </Badge>
          )}
          {row.original.consolidatedIntoId && (
            <Badge variant="outline" className="text-[10px] shrink-0">
              Consolidated
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {row.original.libName}
        </div>
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'ppmpNumber',
    header: 'PPMP No.',
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.getValue('ppmpNumber')}
      </span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'fiscalYearName',
    header: 'Fiscal Year',
    cell: ({ row }) => {
      const fy = row.original.fiscalYearName
      return <span className="text-sm font-medium">{fy}</span>
    },
    enableSorting: true,
  },
  {
    accessorKey: 'totalEstimatedBudget',
    header: () => <span className="text-right block">Budget</span>,
    cell: ({ row }) => (
      <span className="text-sm text-right block font-medium">
        {formatCurrency(row.getValue('totalEstimatedBudget') as number)}
      </span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'state',
    header: 'Status',
    cell: ({ row }) => (
      <PpmpStatusBadge
        state={row.getValue('state')}
        currentApprovalStage={row.original.currentApprovalStage ?? undefined}
      />
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {new Date(row.getValue('createdAt') as string).toLocaleDateString(
          'en-PH',
          {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          },
        )}
      </span>
    ),
    enableSorting: true,
  },
  {
    id: 'actions',
    header: () => <span className="text-center block">Actions</span>,
    cell: ({ row, table }) => {
      const ppmp = row.original as PPMP
      const meta = table.options.meta as TableMeta<PPMP>
      return (
        <div className="flex justify-center">
          <PpmpActions
            row={ppmp}
            onOpen={meta?.onView}
            onDelete={meta?.onDelete}
          />
        </div>
      )
    },
  },
]
