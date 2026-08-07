import { ArrowUpDown } from 'lucide-react'
import { Actions } from './Actions'
import type { ColumnDef } from '@tanstack/react-table'
import type { WFP } from '../..'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { formatDisplayDate } from '@/utils/formatters'

export const Column: Array<ColumnDef<WFP>> = [
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
    accessorKey: 'projectTitle',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Project Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'mode',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Source
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap ${
          row.original.mode === 'OPCR' 
            ? 'bg-gradient-to-r from-amber-600 to-orange-600' 
            : 'bg-gray-500'
        }`}
      >
        {row.original.mode === 'OPCR' ? '🎯 OPCR' : 'External'}
      </span>
    ),
  },
  {
    accessorKey: 'projectStartDate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Start Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <span>{formatDisplayDate(row.original.projectStartDate)}</span>
    }
  },
  {
    accessorKey: 'projectEndDate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          End Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <span>{formatDisplayDate(row.original.projectEndDate)}</span>
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded-full text-sm font-medium text-white ${row.original.status === 'Returned' ? 'bg-red-500' : row.original.status === 'Pending' ? 'bg-orange-500' : row.original.status === 'Approved' ? 'bg-blue-500'  : row.original.status === 'Submitted' ? 'bg-green-500': 'bg-gray-500'}`}
      >
        {row.original.status}
      </span>
    ),
  },
  {
    id: 'actions',
    enableHiding: false,
    header: () => (
      <div className="text-right pr-6 uppercase text-[10px] font-bold text-muted-foreground tracking-widest">
        Controls
      </div>
    ),
    cell: ({ row, table }) => {
      const readonly = table.options.meta?.readonly
      const actions = table.options.meta?.actions
      const data = row.original
      return (
        <div className="flex justify-end pr-4">
          <Actions data={data} readonly={readonly} actions={actions} />
        </div>
      )
    },
  },
]
