/**
 * Template Table List Dashtail for Master KPI
 * Integrates TanStack Table with Dashtail UI / Shadcn
 */

import { useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { motion, AnimatePresence } from 'framer-motion'
import { itemAnimations, useReducedMotion } from '@/utils/animation'
import { columns as getColumns } from './columns'
import { MasterKpiTableToolbar } from '../components/MasterKpiTableToolbar'
import { MasterKPI } from '../types'

interface TemplateTableListDashtailProps {
  data: MasterKPI[]
  onView: (kpi: MasterKPI) => void
  onEdit: (kpi: MasterKPI) => void
  onDelete: (kpi: MasterKPI) => void
  sorting: SortingState
  onSortingChange: (updater: any) => void
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: (updater: any) => void
  columnVisibility: VisibilityState
  onColumnVisibilityChange: (updater: any) => void
  searchValue: string
  onSearchChange: (value: string) => void
  isLoading?: boolean
}

export function TemplateTableListDashtail({
  data,
  onView,
  onEdit,
  onDelete,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  columnVisibility,
  onColumnVisibilityChange,
  searchValue,
  onSearchChange,
  isLoading = false,
}: TemplateTableListDashtailProps) {
  const prefersReducedMotion = useReducedMotion()
  const columns = useMemo(
    () => getColumns(onView, onEdit, onDelete),
    [onView, onEdit, onDelete]
  )

  const table = useReactTable({
    data,
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
    manualPagination: true,
    manualSorting: true, // Use server-side sorting
    manualFiltering: true, // Use server-side filtering
  })

  return (
    <div className="space-y-4">
      <MasterKpiTableToolbar
        table={table}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
      />
      <div className="rounded-md border bg-card text-card-foreground">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.getSize() }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout" initial={false}>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    variants={itemAnimations.slideUpFade}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    transition={{
                      delay: prefersReducedMotion ? 0 : index * 0.05,
                    }}
                    className="group border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {isLoading ? 'Loading KPIs...' : 'No results found.'}
                  </TableCell>
                </TableRow>
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
