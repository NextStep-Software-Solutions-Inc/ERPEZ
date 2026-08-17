import { ArrowUpDown, CheckCircle2, Clock, Circle } from 'lucide-react'
import { useSetAtom } from 'jotai'
import { updateDialogAtom } from '../atoms'
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
      const setUpdateDialog = useSetAtom(updateDialogAtom)
      const rawTimelines = row.original.wfpObjectiveTimelines || []
      if (rawTimelines.length === 0) {
        return <span className="text-xs text-slate-400 font-medium">No timelines configured</span>
      }

      // Sort timelines strictly chronologically by startDate
      const sortedTimelines = [...rawTimelines].sort((a, b) => {
        const timeA = a.startDate ? new Date(a.startDate).getTime() : 0
        const timeB = b.startDate ? new Date(b.startDate).getTime() : 0
        return timeA - timeB
      })

      const now = new Date()
      let completedCount = 0

      const timelineType = sortedTimelines[0]?.timelineType || 'Quarterly'

      const processedTimelines = sortedTimelines.map((timeline, idx) => {
        const startDate = timeline.startDate ? new Date(timeline.startDate) : null
        const endDate = timeline.endDate ? new Date(timeline.endDate) : null

        let status: 'Completed' | 'In Progress' | 'Upcoming' = 'Upcoming'

        if (endDate && now > endDate) {
          status = 'Completed'
          completedCount++
        } else if (startDate && endDate && now >= startDate && now <= endDate) {
          status = 'In Progress'
        }

        const year = startDate ? startDate.getFullYear() : 2026
        let label = `Q${idx + 1} ${year}`

        if (timelineType === 'Monthly' && startDate) {
          label = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        } else if (timelineType === 'Annual' && startDate) {
          label = `${year}`
        } else if (timelineType === 'Weekly') {
          label = `W${idx + 1} ${year}`
        } else if (timelineType === 'Daily' && startDate) {
          label = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        } else if (startDate) {
          const month = startDate.getMonth()
          const qNum = Math.floor(month / 3) + 1
          label = `Q${qNum} ${year}`
        }
        return { ...timeline, status, label, idx }
      })

      const contentWidth = processedTimelines.length * 125 + Math.max(0, processedTimelines.length - 1) * 8
      const containerWidth = Math.max(180, contentWidth)

      return (
        <div className="py-1" style={{ width: `${containerWidth}px` }}>
          {/* Quarterly Cards */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {processedTimelines.map((timeline) => {
              const startFmt = formatDisplayDate(timeline.startDate)
              const endFmt = formatDisplayDate(timeline.endDate)

              return (
                <div
                  key={timeline.id || timeline.idx}
                  onClick={() =>
                    setUpdateDialog({
                      isOpen: true,
                      selectedId: row.original.id,
                      showUnsavedWarning: false,
                    })
                  }
                  title="Click to view or edit timeline details"
                  className={`flex-shrink-0 w-[125px] p-2.5 rounded-xl border transition-all duration-200 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm hover:-translate-y-0.5 flex flex-col items-center justify-between text-center space-y-1 ${
                    timeline.status === 'Completed'
                      ? 'bg-slate-50/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700'
                      : timeline.status === 'In Progress'
                        ? 'bg-blue-50/20 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 shadow-2xs'
                        : 'bg-slate-50/40 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="text-center w-full">
                    <div className="font-extrabold text-xs text-slate-800 dark:text-slate-100 tracking-tight">
                      {timeline.label}
                    </div>
                    <div className="text-[10px] font-medium text-slate-400 dark:text-slate-400 leading-tight">
                      {startFmt} – {endFmt}
                    </div>
                  </div>

                  <div className="py-0.5 flex items-center justify-center w-full">
                    {timeline.status === 'Completed' ? (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" /> Completed
                      </span>
                    ) : timeline.status === 'In Progress' ? (
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" /> In Progress
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
                        <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" /> Upcoming
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1 w-full text-center">
                    Target: <strong className="text-slate-800 dark:text-slate-100 font-bold">{timeline.targetValue}</strong>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Segmented Progress Bar */}
          <div
            className="flex items-center gap-2 mt-1.5 max-w-full"
            style={{
              width: `${containerWidth}px`,
            }}
          >
            <div className="flex-1 flex gap-1 h-1.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 p-0.5">
              {processedTimelines.map((timeline) => (
                <div
                  key={timeline.id || timeline.idx}
                  className={`flex-1 h-full rounded-full transition-all ${
                    timeline.status === 'Completed'
                      ? 'bg-emerald-500'
                      : timeline.status === 'In Progress'
                        ? 'bg-blue-600 dark:bg-blue-500'
                        : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {completedCount} of {processedTimelines.length} completed
            </span>
          </div>
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
