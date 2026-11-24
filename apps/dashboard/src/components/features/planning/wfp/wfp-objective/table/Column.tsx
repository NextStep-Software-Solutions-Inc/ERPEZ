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
      const activities = (row.original as any).wfpObjectiveActivities || row.original.wfpObjectiveTargets || []
      return <span>{activities.length}</span>
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
      const objWeight = (row.original.weight as number) || 0
      const activities = (row.original as any).wfpObjectiveActivities || row.original.wfpObjectiveTargets || []
      const actsWeightSum = activities.reduce((sum: number, act: any) => sum + (Number(act.weight) || 0), 0)
      
      const isFullyAllocated = actsWeightSum === objWeight && objWeight > 0
      const isOverAllocated = actsWeightSum > objWeight
      const remaining = objWeight - actsWeightSum

      return (
        <div className="flex flex-col space-y-0.5">
          <span className="font-bold text-slate-800 text-xs">{objWeight}%</span>
          {objWeight > 0 && (
            <div>
              {isFullyAllocated ? (
                <span className="text-[10px] text-emerald-600 font-semibold block">
                  ✓ {actsWeightSum}% / {objWeight}% Activities Allocated
                </span>
              ) : isOverAllocated ? (
                <span className="text-[10px] text-rose-600 font-semibold block">
                  ⚠ {actsWeightSum}% / {objWeight}% ({actsWeightSum - objWeight}% Over)
                </span>
              ) : (
                <span className="text-[10px] text-amber-600 font-semibold block">
                  {actsWeightSum}% / {objWeight}% ({remaining}% Unallocated)
                </span>
              )}
            </div>
          )}
        </div>
      )
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
