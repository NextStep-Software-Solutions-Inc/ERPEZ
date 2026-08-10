import { ArrowUpDown, Calendar } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import type { AppFiscalYear } from '@/features/planning/annual-performance-planning/appTypes'
import Actions from './Actions'

// Status badge styling
const getStatusColor = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'setup':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'closed':
    case 'archived':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusIcon = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'setup':
      return '⚙️'
    case 'active':
      return '✓'
    case 'closed':
    case 'archived':
      return '🔒'
    default:
      return '○'
  }
}

export const AppFiscalYearColumns: Array<ColumnDef<AppFiscalYear>> = [
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
    accessorKey: 'id',
    id: 'id',
    header: () => null,
    cell: () => null,
    enableHiding: true,
    enableSorting: false,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'year',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="gap-2"
        >
          Fiscal Year
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const year = row.getValue('year') as number
      return (
        <div className="flex items-center gap-2 font-semibold">
          <Calendar className="h-4 w-4 text-blue-500" />
          FY {year}
        </div>
      )
    },
  },
  {
    accessorKey: 'startDate',
    header: ({ column }) => {
      return (
        <div className="text-center w-full">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="w-full justify-center gap-2"
          >
            Start Date
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue('startDate')
      return (
        <div className="text-center text-sm">
          {date ? new Date(date as string).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }) : '-'}
        </div>
      )
    },
  },
  {
    accessorKey: 'endDate',
    header: ({ column }) => {
      return (
        <div className="text-center w-full">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="w-full justify-center gap-2"
          >
            End Date
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue('endDate')
      return (
        <div className="text-center text-sm">
          {date ? new Date(date as string).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }) : '-'}
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <div className="text-center w-full">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="w-full justify-center gap-2"
          >
            Status
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <div className="flex justify-center">
          <Badge className={`gap-1 ${getStatusColor(status)}`}>
            <span>{getStatusIcon(status)}</span>
            <span className="capitalize">{status || 'Draft'}</span>
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => {
      return (
        <div className="text-center w-full">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="w-full justify-center gap-2"
          >
            Description
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const description = row.getValue('description')
      const displayText = description ? String(description).substring(0, 50) : '-'
      return (
        <div className="text-center text-sm text-gray-600 truncate">
          {displayText}
          {description && String(description).length > 50 ? '...' : ''}
        </div>
      )
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row, table }) => {
      const data = row.original
      const readonly = table.options.meta?.readonly || false
      return <Actions data={data} readonly={readonly} />
    },
  },
]
