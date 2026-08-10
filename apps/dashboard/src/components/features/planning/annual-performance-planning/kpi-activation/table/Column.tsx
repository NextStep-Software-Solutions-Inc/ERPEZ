/**
 * KPI Activation Table Columns
 * Step 2: Configure activated KPIs
 */

import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import type { ActivatedKPIRow } from './types'
import { Actions } from './Actions.tsx'

export const useDynamicColumns = (): Array<ColumnDef<ActivatedKPIRow>> => {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'code',
      header: ({ column }) => {
        return (
          <Button
            type="button"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            KPI Code
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">{row.getValue('code')}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            type="button"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            KPI Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const data = row.original
        return (
          <div>
            <div className="font-medium text-gray-900">{row.getValue('name')}</div>
            {data.description && (
              <div className="text-sm text-gray-500 truncate max-w-lg">
                {data.description}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'functionType',
      header: ({ column }) => {
        return (
          <Button
            type="button"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Function Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {row.getValue('functionType')}
        </Badge>
      ),
    },
    {
      accessorKey: 'aggregationMethod',
      header: ({ column }) => {
        return (
          <Button
            type="button"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Aggregation Method
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <Badge variant="soft" className="text-xs">
          {row.getValue('aggregationMethod')}
        </Badge>
      ),
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => {
        return (
          <Button
            type="button"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const isActive = row.getValue('isActive')
        return (
          <Badge
            variant={isActive ? 'soft' : 'outline'}
            className="text-xs"
          >
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'activatedDate',
      header: ({ column }) => {
        return (
          <Button
            type="button"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Activated Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue('activatedDate'))
        return date.toLocaleDateString()
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ table }) => {
        const readonly = table.options.meta?.readonly
        const actions = table.options.meta?.actions
        return <Actions readonly={readonly} actions={actions} />
      },
    },
  ]
}

export const Column: Array<ColumnDef<ActivatedKPIRow>> = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'code',
    header: 'KPI Code',
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">{row.getValue('code')}</span>
    ),
  },
  {
    accessorKey: 'name',
    header: 'KPI Name',
    cell: ({ row }) => {
      const data = row.original
      return (
        <div>
          <div className="font-medium text-gray-900">{row.getValue('name')}</div>
          {data.description && (
            <div className="text-sm text-gray-500 truncate max-w-lg">
              {data.description}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'functionType',
    header: 'Function Type',
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {row.getValue('functionType')}
      </Badge>
    ),
  },
  {
    accessorKey: 'aggregationMethod',
    header: 'Aggregation Method',
    cell: ({ row }) => (
      <Badge variant="soft" className="text-xs">
        {row.getValue('aggregationMethod')}
      </Badge>
    ),
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive')
      return (
        <Badge
          variant={isActive ? 'soft' : 'outline'}
          className="text-xs"
        >
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'activatedDate',
    header: 'Activated Date',
    cell: ({ row }) => {
      const date = new Date(row.getValue('activatedDate'))
      return date.toLocaleDateString()
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ table }) => {
      const readonly = table.options.meta?.readonly
      const actions = table.options.meta?.actions
      return <Actions readonly={readonly} actions={actions} />
    },
  },
]
