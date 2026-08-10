'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type { OrgUnit } from './types'
import OrgUnitActions from './OrgUnitActions'
import type { MetaActions } from '@/types/global'
import { formatRelativeDate } from '@/utils/formatters'
import { Badge } from '@/components/ui/badge'
import { Building2Icon } from 'lucide-react'

export const createOrgUnitColumns = (
  actions: MetaActions,
  orgUnits?: OrgUnit[],
): ColumnDef<OrgUnit>[] => [
  {
    accessorKey: 'name',
    header: 'Organization Unit',
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      const type = row.original.type as string
      return (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
            <Building2Icon className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-default-900 text-sm">{name}</div>
            <div className="text-[10px] text-default-500 font-medium capitalize">{type}</div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => {
      const code = row.getValue('code') as string
      return (
        <div className="font-mono text-xs font-semibold text-primary bg-primary/5 px-2 py-1 rounded w-fit">
          {code || '-'}
        </div>
      )
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      const typeColors: Record<string, string> = {
        'Oversight': 'bg-primary/10 text-primary',
        'Delivery': 'bg-success/10 text-success',
        'Support': 'bg-info/10 text-info',
      }
      return (
        <Badge color="default" className={`text-[10px] font-semibold uppercase tracking-wider ${(type && typeColors[type]) || 'bg-default-100 text-default-700'}`}>
          {type}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'parentId',
    header: 'Parent Unit',
    cell: ({ row }) => {
      const parentId = row.original.parentId
      const parent = orgUnits?.find(u => u.id === parentId)
      return (
        <div className="text-sm text-default-600">
          {parent ? (
            <div className="flex items-center gap-1">
              <span className="text-default-400 text-xs">└</span>
              <span className="font-medium">{parent.name}</span>
            </div>
          ) : (
            <span className="text-default-400 italic">Root Unit</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.getValue('description') as string
      return (
        <div className="text-sm text-default-600 line-clamp-2">
          {description || <span className="text-default-400 italic">No description</span>}
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status as string
      const isActive = status === 'active'
      return (
        <Badge color={isActive ? 'success' : 'secondary'} className="text-[10px] font-semibold uppercase">
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
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
      <OrgUnitActions
        data={row.original}
        actions={actions}
      />
    ),
  },
] as const
