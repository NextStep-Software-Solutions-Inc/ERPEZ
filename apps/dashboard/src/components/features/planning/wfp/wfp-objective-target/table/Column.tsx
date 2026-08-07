import { ArrowUpDown } from 'lucide-react'
import { Actions } from './Actions'
import type { ColumnDef } from '@tanstack/react-table'
import type { WFPObjectiveTarget } from './types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { formatDisplayDate, toSentenceCase, toTitleCase } from '@/utils/formatters'

export const Column: Array<ColumnDef<WFPObjectiveTarget>> = [
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
    id: 'number',
    header: '#',
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex(r => r.id === row.id) + 1
      return <span className="font-medium">1.{index}</span>
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'activityName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Activity Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <span className="font-semibold">{toTitleCase(row.original.activityName)}</span>
    }
  },
  {
    accessorKey: 'indicator',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Output Indicator
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <span>{toSentenceCase(row.original.indicator)}</span>
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
      const weight = row.getValue('weight') as number
      return <span>{weight}%</span>
    }
  },
  {
    id: 'timelineType',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Timeline Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const timelineType = row.original.wfpObjectiveTimelines?.[0]?.timelineType || 'N/A'
      return <span>{timelineType}</span>
    }
  },
  {
    id: 'timelines',
    header: 'Timelines',
    cell: ({ row }) => {
      const timelines = row.original.wfpObjectiveTimelines || []
      const getTimelineColor = (timelineType: string) => {
        switch (timelineType) {
          case 'Quarterly':
            return 'bg-orange-100'
          case 'Annual':
            return 'bg-yellow-100'
          case 'Monthly':
            return 'bg-green-100'
          case 'Weekly':
            return 'bg-purple-100'
          case 'Daily':
            return 'bg-blue-100'
          default:
            return 'bg-gray-100'
        }
      }

      return (
        <div className="flex gap-2 overflow-x-auto">
          {timelines.map((timeline, idx) => (
            <div
              key={timeline.id}
              className={`flex-shrink-0 p-2 rounded border text-xs ${getTimelineColor(timeline.timelineType)}`}
            >
              <div className="font-semibold">
                {formatDisplayDate(timeline.startDate)} → {formatDisplayDate(timeline.endDate)}
              </div>
              <div className="font-bold">
                Target: {timeline.targetValue}
              </div>
            </div>
          ))}
        </div>
      )
    },
    enableSorting: false,
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
