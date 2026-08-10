import { ColumnDef } from '@tanstack/react-table'
import { MasterKpiTableColumnHeader } from '../components/MasterKpiTableColumnHeader'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { MasterKPI, getFrequencyLabel, getComplianceTagColor } from '../types'
import { DataTableRowActions } from './templates/actions'
import { Check, X, Target, Calendar, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { KpiValueBadge, getHierarchyBadge } from '../utils/kpiBadgeUtils'

interface GetColumnsProps {
  onView: (data: MasterKPI) => void
  onEdit: (data: MasterKPI) => void
  onDelete: (data: MasterKPI) => void
}

export const getColumns = ({
  onView,
  onEdit,
  onDelete,
}: GetColumnsProps): ColumnDef<MasterKPI>[] => [
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
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <MasterKpiTableColumnHeader
        column={column}
        title="Indicator Code"
        className="w-[120px]"
      />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 group/code">
        <Badge
          variant="outline"
          className="bg-muted/30 border-muted-foreground/20 text-muted-foreground font-mono transition-colors group-hover/code:border-primary/40 group-hover/code:bg-primary/5 group-hover/code:text-foreground"
        >
          {row.getValue('code')}
        </Badge>
      </div>
    ),
    meta: { label: 'Code' },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <MasterKpiTableColumnHeader
        column={column}
        title="Performance Indicator"
        className="min-w-[300px]"
      />
    ),
    cell: ({ row }) => {
      const description = row.original.operationalDefinition
      return (
        <div className="flex flex-col gap-0.5 max-w-[450px]">
          <span className="text- text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {row.getValue('name')}
          </span>
          {description && (
            <span className="text-[11px] text-muted-foreground line-clamp-1 font-normal opacity-70">
              {description}
            </span>
          )}
        </div>
      )
    },
    meta: { label: 'Name' },
  },
  {
    accessorKey: 'monitoringFrequency',
    header: ({ column }) => (
      <MasterKpiTableColumnHeader
        column={column}
        title="Frequency"
        className="w-[140px]"
      />
    ),
    cell: ({ row }) => {
      const freq = row.original.monitoringFrequency
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-xs font-medium">{getFrequencyLabel(freq)}</span>
        </div>
      )
    },
    meta: { label: 'Frequency' },
  },
  {
    accessorKey: 'isGAD',
    header: ({ column }) => (
      <MasterKpiTableColumnHeader
        column={column}
        title="GAD"
        className="w-20"
      />
    ),
    cell: ({ row }) => {
      const isGad = !!row.getValue('isGAD')
      return (
        <div className="flex justify-center">
          <Badge
            variant={isGad ? 'soft' : 'outline'}
            className={cn(
              'text-[10px] px-2 py-0',
              isGad
                ? 'bg-pink-500/10 text-pink-600 border-pink-200'
                : 'opacity-40',
            )}
          >
            {isGad ? 'Yes' : 'No'}
          </Badge>
        </div>
      )
    },
    meta: { label: 'GAD' },
  },
  {
    accessorKey: 'complianceTags',
    id: 'complianceTags',
    header: ({ column }) => (
      <MasterKpiTableColumnHeader
        column={column}
        title="Compliance"
        className="w-[150px]"
      />
    ),
    cell: ({ row }) => {
      const tags = row.original.complianceTags || []
      if (tags.length === 0)
        return (
          <span className="text-muted-foreground text-[10px] italic">None</span>
        )
      return (
        <div className="flex flex-wrap gap-1 max-w-[150px]">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="soft"
              className={cn('text-[9px] px-1 py-0', getComplianceTagColor(tag))}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )
    },
    meta: { label: 'Compliance Tags' },
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <MasterKpiTableColumnHeader
        column={column}
        title="Status"
        className="w-[100px]"
      />
    ),
    cell: ({ row }) => {
      const isActive = !!row.getValue('isActive')
      return (
        <Badge
          variant="outline"
          className={cn(
            'text-[10px] px-2 py-0 border-none',
            isActive
              ? 'bg-emerald-500/10 text-emerald-600'
              : 'bg-rose-500/10 text-rose-600',
          )}
        >
          <Activity className="mr-1 h-3 w-3" />
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    meta: { label: 'Active Status' },
  },
  {
    accessorKey: 'parentKPIId',
    header: ({ column }) => (
      <MasterKpiTableColumnHeader
        column={column}
        title="Hierarchy"
        className="w-[150px]"
      />
    ),
    cell: ({ row }) => {
      const hierarchyBadge = getHierarchyBadge(row.original.parentKPIId)

      return (
        <div className="flex flex-col gap-1">
          <KpiValueBadge {...hierarchyBadge} />
          {row.original.parentKPIId && (
            <span className="text-[10px] font-mono text-muted-foreground">
              Parent: {row.original.parentKPIId}
            </span>
          )}
        </div>
      )
    },
    meta: { label: 'Hierarchy' },
  },
  {
    accessorKey: 'mfopapId',
    header: ({ column }) => (
      <MasterKpiTableColumnHeader
        column={column}
        title="Major Final Output ID"
        className="w-[100px]"
      />
    ),
    cell: ({ row }) => (
      <span className="text-[10px] font-mono text-muted-foreground">
        {row.original.mfopapId || '-'}
      </span>
    ),
    meta: { label: 'Major Final Output ID' },
  },
  {
    accessorKey: 'functionCategory',
    id: 'functionCategory',
    header: ({ column }) => (
      <MasterKpiTableColumnHeader
        column={column}
        title="Category"
        className="w-[140px]"
      />
    ),
    cell: ({ row }) => {
      const type = row.original.functionCategory as string
      return (
        <Badge
          className={cn(
            'rounded-md px-2.5 py-0.5 font-semibold text-[11px] uppercase tracking-wider shadow-sm border-none transition-transform hover:scale-105',
            type === 'Core'
              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
              : type === 'Support'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
          )}
        >
          {type || 'N/A'}
        </Badge>
      )
    },
    meta: { label: 'Category' },
  },
  {
    accessorKey: 'isOptIn',
    header: ({ column }) => (
      <MasterKpiTableColumnHeader
        column={column}
        title="Opt-In"
        className="w-20"
      />
    ),
    cell: ({ row }) => {
      const isOptIn = !!row.getValue('isOptIn')
      return (
        <div className="flex justify-center">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'flex items-center justify-center h-8 w-8 rounded-full transition-all duration-300',
                    isOptIn
                      ? 'bg-primary/15 text-primary scale-110 shadow-[0_0_12px_rgba(var(--primary),0.2)]'
                      : 'bg-muted/50 text-muted-foreground opacity-40 hover:opacity-100',
                  )}
                >
                  {isOptIn ? (
                    <Check className="h-4 w-4 stroke-[3px]" />
                  ) : (
                    <X className="h-3 w-3 stroke-[2px]" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-popover/90 backdrop-blur font-medium"
              >
                {isOptIn
                  ? 'Indicator is available for agency opt-in'
                  : 'Opt-in restricted'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    },
    meta: { label: 'Opt-In' },
  },
  {
    accessorKey: 'measurementUnit',
    id: 'measurementUnit',
    header: ({ column }) => (
      <MasterKpiTableColumnHeader
        column={column}
        title="Unit"
        className="w-[120px]"
      />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-muted-foreground italic font-medium">
        <Target className="h-3.5 w-3.5 opacity-50" />
        <span className="text-xs">{row.original.measurementUnit || 'N/A'}</span>
      </div>
    ),
    meta: { label: 'Unit' },
  },
  {
    accessorKey: 'developmentGoals',
    id: 'developmentGoals',
    header: ({ column }) => (
      <MasterKpiTableColumnHeader
        column={column}
        title="SDG"
        className="w-[120px]"
      />
    ),
    cell: ({ row }) => {
      const goals = row.original.SDGs?.map((sdg) => sdg.name) || []
      if (!goals || goals.length === 0)
        return <span className="text-muted-foreground text-xs italic">N/A</span>
      return (
        <div className="flex flex-wrap gap-1 max-w-[150px]">
          {goals.map((goal, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-[10px] px-1 py-0 border-primary/20 bg-primary/5 text-primary"
            >
              {goal.split(':')[0]}
            </Badge>
          ))}
        </div>
      )
    },
    meta: { label: 'SDG' },
  },
  {
    accessorKey: 'targetDistributionBehavior',
    id: 'targetDistributionBehavior',
    header: ({ column }) => (
      <MasterKpiTableColumnHeader
        column={column}
        title="Distribution"
        className="w-[140px]"
      />
    ),
    cell: ({ row }) => {
      const value = row.original.targetDistributionBehavior
      return (
        <span className="text-xs font-medium text-muted-foreground">
          {value || 'N/A'}
        </span>
      )
    },
    meta: { label: 'Target Distribution' },
  },
  {
    id: 'actions',
    header: () => (
      <div className="text-right pr-6 uppercase text-[10px] font-bold text-muted-foreground tracking-widest">
        Controls
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-end pr-4">
        <DataTableRowActions
          row={row}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    ),
  },
]
