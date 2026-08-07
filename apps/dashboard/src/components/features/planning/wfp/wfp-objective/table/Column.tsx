import { ArrowUpDown } from 'lucide-react'
import { Actions } from './Actions'
import type { ColumnDef } from '@tanstack/react-table'
import type { WFPObjective } from './types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toSentenceCase } from '@/utils/formatters'

  export const Column: Array<ColumnDef<WFPObjective>> = [
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
    accessorKey: 'description',
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
    cell: ({ row }) => {
      return <span>{toSentenceCase(row.original.description)}</span>
    }
  },
  {
    accessorKey: 'numberOfActivities',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          No. of Activities
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const numberOfActivities = row.original.wfpObjectiveTargets?.length || 0
      return <span>{numberOfActivities}</span>
    }
  },
  {
    accessorKey: 'weight',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Weight
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const weight = row.original.weight as number
      return <span className="font-semibold text-green-700">{weight}%</span>
    }
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
