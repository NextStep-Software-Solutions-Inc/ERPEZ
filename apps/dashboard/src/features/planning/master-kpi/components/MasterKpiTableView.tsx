/**
 * Master KPI Table View Component
 * Displays KPIs in a sortable, interactive table format using TanStack Table
 * Features: Column filtering, sorting, visibility toggle, and result animations
 */

import { useMemo } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  itemAnimations,
  useReducedMotion,
  contentLoadAnimations,
} from '@/utils/animation'
import { MasterKpiTableToolbar } from './MasterKpiTableToolbar'
import { MasterKpiTableColumnHeader } from './MasterKpiTableColumnHeader'
import {
  MasterKPI,
  getDistributionBehaviorColor,
  getDistributionBehaviorLabel,
  getFrequencyLabel,
  getMeasurementUnitLabel,
} from '../types'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'

export interface MasterKpiTableViewProps {
  kpis: MasterKPI[]
  onView: (kpi: MasterKPI) => void
  onEdit: (kpi: MasterKPI) => void
  onDelete: (kpi: MasterKPI) => void
  sorting: SortingState
  onSortingChange: (
    updater: SortingState | ((old: SortingState) => SortingState),
  ) => void
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: (
    updater:
      | ColumnFiltersState
      | ((old: ColumnFiltersState) => ColumnFiltersState),
  ) => void
  columnVisibility: VisibilityState
  onColumnVisibilityChange: (
    updater: VisibilityState | ((old: VisibilityState) => VisibilityState),
  ) => void
  isLoading?: boolean
}

const columnHelper = createColumnHelper<MasterKPI>()

// Color map for function categories
const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Strategic':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'Core':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'Support':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

export function MasterKpiTableView(props: MasterKpiTableViewProps) {
  const {
    kpis,
    onView,
    onEdit,
    onDelete,
    sorting,
    onSortingChange,
    columnFilters,
    onColumnFiltersChange,
    columnVisibility,
    onColumnVisibilityChange,
    isLoading = false,
  } = props

  const prefersReducedMotion = useReducedMotion()
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
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
        size: 40,
      }),
      columnHelper.accessor('code', {
        id: 'code',
        header: ({ column }) => (
          <MasterKpiTableColumnHeader column={column} title="Code" />
        ),
        cell: (info) => (
          <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
            {info.getValue()}
          </code>
        ),
        meta: { label: 'Code' },
        size: 100,
      }),
      columnHelper.accessor('name', {
        id: 'name',
        header: ({ column }) => (
          <MasterKpiTableColumnHeader column={column} title="Name" />
        ),
        cell: (info) => (
          <div className="max-w-xs truncate font-medium">{info.getValue()}</div>
        ),
        meta: { label: 'Name' },
        size: 250,
      }),
      columnHelper.accessor('operationalDefinition', {
        id: 'operationalDefinition',
        header: ({ column }) => (
          <MasterKpiTableColumnHeader
            column={column}
            title="Operational Definition"
          />
        ),
        cell: (info) => (
          <div className="max-w-md truncate text-muted-foreground text-xs">
            {info.getValue()}
          </div>
        ),
        enableHiding: true,
        meta: { label: 'Definition' },
        size: 300,
      }),
      columnHelper.accessor('monitoringFrequency', {
        id: 'monitoringFrequency',
        header: ({ column }) => (
          <MasterKpiTableColumnHeader column={column} title="Frequency" />
        ),
        cell: (info) => (
          <span className="text-xs">{getFrequencyLabel(info.getValue())}</span>
        ),
        meta: { label: 'Frequency' },
        size: 120,
      }),
      columnHelper.accessor('measurementUnit', {
        id: 'measurementUnit',
        header: ({ column }) => (
          <MasterKpiTableColumnHeader column={column} title="Unit" />
        ),
        cell: (info) => (
          <span className="text-xs">
            {getMeasurementUnitLabel(info.getValue())}
          </span>
        ),
        meta: { label: 'Unit' },
        size: 120,
      }),
      columnHelper.accessor('isGAD', {
        id: 'isGAD',
        header: ({ column }) => (
          <MasterKpiTableColumnHeader column={column} title="GAD" />
        ),
        cell: (info) => (
          <Badge variant={info.getValue() ? 'soft' : 'outline'}>
            {info.getValue() ? 'Yes' : 'No'}
          </Badge>
        ),
        meta: { label: 'GAD' },
        size: 80,
      }),
      columnHelper.accessor('tags.functionCategory', {
        id: 'functionCategory',
        header: ({ column }) => (
          <MasterKpiTableColumnHeader column={column} title="Function" />
        ),
        cell: (info) => (
          <Badge
            variant="outline"
            className={getCategoryColor(info.getValue())}
          >
            {info.getValue()}
          </Badge>
        ),
        filterFn: (row, id, value: string[]) => {
          return value.includes(row.getValue(id) as string)
        },
        meta: { label: 'Function' },
        size: 120,
      }),
      columnHelper.accessor('tags.complianceTags', {
        id: 'complianceTags',
        header: 'Compliance',
        cell: (info) => {
          const tags = info.getValue() || []
          return (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 2).map((tag, idx) => (
                <Badge key={idx} variant="soft" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 2 && (
                <Badge variant="soft" className="text-xs">
                  +{tags.length - 2}
                </Badge>
              )}
            </div>
          )
        },
        meta: { label: 'Compliance' },
        size: 150,
      }),
      columnHelper.accessor('tags.developmentGoals', {
        id: 'developmentGoals',
        header: 'SDG/PDP',
        cell: (info) => {
          const goals = info.getValue() || []
          return (
            <div className="flex flex-wrap gap-1">
              {goals.slice(0, 1).map((goal, idx) => (
                <Badge key={idx} variant="soft" className="text-xs">
                  {goal.split(':')[0]}
                </Badge>
              ))}
              {goals.length > 1 && (
                <Badge variant="soft" className="text-xs">
                  +{goals.length - 1}
                </Badge>
              )}
            </div>
          )
        },
        meta: { label: 'SDG/PDP' },
        size: 150,
      }),
      columnHelper.accessor('targetDistributionBehavior', {
        id: 'targetDistributionBehavior',
        header: 'Distribution',
        cell: (info) => {
          const behavior = info.getValue()
          if (!behavior)
            return <span className="text-xs text-muted-foreground">-</span>
          return (
            <Badge
              variant="outline"
              className={`text-xs ${getDistributionBehaviorColor(behavior)}`}
            >
              {getDistributionBehaviorLabel(behavior)}
            </Badge>
          )
        },
        meta: { label: 'Distribution' },
        size: 150,
      }),
      columnHelper.accessor('isOptIn', {
        id: 'isOptIn',
        header: ({ column }) => (
          <MasterKpiTableColumnHeader column={column} title="Opt-In" />
        ),
        cell: (info) => (
          <Badge variant={info.getValue() ? 'soft' : 'outline'}>
            {info.getValue() ? 'Yes' : 'No'}
          </Badge>
        ),
        meta: { label: 'Opt-In' },
        size: 80,
      }),
      columnHelper.accessor('isActive', {
        id: 'isActive',
        header: ({ column }) => (
          <MasterKpiTableColumnHeader column={column} title="Status" />
        ),
        cell: (info) => (
          <Badge variant={info.getValue() ? undefined : 'outline'}>
            {info.getValue() ? 'Active' : 'Inactive'}
          </Badge>
        ),
        filterFn: (row, id, value: string[]) => {
          const val = String(row.getValue(id))
          return value.includes(val)
        },
        meta: { label: 'Status' },
        size: 100,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(row.original)}
                title="View"
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(row.original)}
                title="Edit"
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(row.original)}
                title="Delete"
                className="h-8 w-8 p-0 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        ),
        enableHiding: false,
        size: 120,
      }),
    ],
    [onView, onEdit, onDelete],
  )

  const table = useReactTable({
    data: kpis,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
  })

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Toolbar with search and filters */}
      <MasterKpiTableToolbar table={table} />

      {/* Table */}
      {table.getRowModel().rows.length === 0 ? (
        <motion.div
          className="text-center py-12"
          variants={itemAnimations.slideUpFade}
          initial="hidden"
          animate="show"
        >
          <p className="text-muted-foreground">
            No KPIs found. Try adjusting your filters.
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="border rounded-lg overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="hover:bg-transparent"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="bg-muted/50 font-semibold"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={`table-rows-${isLoading}`}
                    className="contents"
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    variants={
                      prefersReducedMotion
                        ? undefined
                        : contentLoadAnimations.loadStagger
                    }
                  >
                    {table.getRowModel().rows.map((row) => (
                      <motion.tr
                        key={row.id}
                        className={cn(
                          'border-b transition-colors hover:bg-muted/50',
                          row.getIsSelected() && 'bg-muted',
                        )}
                        variants={
                          prefersReducedMotion
                            ? undefined
                            : contentLoadAnimations.cardLoadFade
                        }
                        layout
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-4">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </motion.tr>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
