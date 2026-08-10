'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type { Position } from './types'
import type { OrgUnit } from './types'
import PositionActions from './PositionActions'
import type { MetaActions } from '@/types/global'
import { formatRelativeDate } from '@/utils/formatters'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Building2Icon } from 'lucide-react'

export const createPositionColumns = (
  actions: MetaActions,
  orgUnits?: OrgUnit[],
): ColumnDef<Position>[] => [
  {
    accessorKey: 'itemNumber',
    header: 'Item No.',
    cell: ({ row }) => {
      const itemNumber = row.original.itemNumber
      return (
        <div className="font-mono text-xs font-semibold text-primary bg-primary/5 px-2 py-1 rounded border border-primary/10">
          {itemNumber || 'N/A'}
        </div>
      )
    },
  },
  {
    accessorKey: 'title',
    header: 'Position Title',
    cell: ({ row }) => {
      const title = row.getValue('title') as string
      const orgUnitId = row.original.orgUnitId
      const unit = orgUnits?.find(u => u.id === orgUnitId)
      return (
        <div className="flex items-start gap-2">
          <div className="h-8 w-8 bg-info/10 rounded-lg flex items-center justify-center text-info flex-shrink-0 mt-0.5">
            <Briefcase className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-default-900 text-sm">{title}</div>
            {unit && (
              <div className="text-[10px] text-default-500 font-medium flex items-center gap-1 mt-0.5">
                <Building2Icon className="h-3 w-3" />
                <span className="truncate">{unit.name}</span>
              </div>
            )}
          </div>
        </div>
      )
    },
  },
  {
    id: 'salaryGrade',
    accessorFn: (pos) => {
      const sg = pos.salaryGrade
      if (!sg) return '-'
      return typeof sg === 'string' ? sg : sg.name || '-'
    },
    header: 'Grade',
    cell: ({ row }) => {
      const sg = row.original.salaryGrade
      const gradeName =
        typeof sg === 'string' ? sg : sg?.name || '-'
      return (
        <Badge variant="outline" className="font-semibold text-default-700 bg-background border-default-200">
          {gradeName}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'authorizedFTE',
    header: 'FTE',
    cell: ({ row }) => {
      const fte = row.original.authorizedFTE
      return (
        <div className="font-semibold text-default-900 text-center">
          {fte}
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const statusMap: Record<string, { color: 'success' | 'warning' | 'destructive' | 'default'; label: string }> = {
        'filled': { color: 'success', label: 'Filled' },
        'vacant': { color: 'warning', label: 'Vacant' },
        'frozen': { color: 'destructive', label: 'Frozen' },
      }
      const statusInfo = statusMap[status] || { color: 'default', label: status }
      return (
        <Badge color={statusInfo.color} className="text-[10px] font-semibold uppercase tracking-wider">
          {statusInfo.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => {
      const code = row.getValue('code') as string
      return <div className="text-xs text-default-500 font-mono">{code || '-'}</div>
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Last Updated',
    cell: ({ row }) => {
      const date = row.original.updatedAt as string | undefined
      return (
        <div className="text-sm text-default-500 whitespace-nowrap">
          {date ? formatRelativeDate(date) : '-'}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <PositionActions
        data={row.original}
        actions={actions}
      />
    ),
  },
] as const
