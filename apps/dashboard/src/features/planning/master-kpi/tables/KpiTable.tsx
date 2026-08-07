/**
 * Master KPI Table Component
 * Uses @tanstack/react-table v8 with TanStack Table pattern
 */
import { useMemo, useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'
import { useAtom } from 'jotai'
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
import { Edit2, Trash2, ChevronDown } from 'lucide-react'
import {
  editKpiDialogOpenAtom,
  deleteKpiDialogOpenAtom,
  selectedKpiForEditAtom,
  selectedKpiForDeleteAtom,
  kpiHierarchyFilterAtom,
  kpiTablePageAtom,
  kpiTablePageSizeAtom,
} from '../atoms'
import { MasterKPI, FunctionCategory } from '../types'
import { mapKpiListItemToMasterKPI } from '../utils/kpiMapper'
import { KpiPaginationFooter } from '../components/KpiPaginationFooter'

interface MasterKpiTableProps {
  data: MasterKPI[]
  onLoadMore?: () => void
  isLoading?: boolean
  totalCount?: number
  totalPages?: number
  totalRows?: number
}

/**
 * Get badge color based on function category
 */
function getCategoryColor(category: FunctionCategory) {
  switch (category) {
    case FunctionCategory.STRATEGIC:
      return 'info'
    case FunctionCategory.CORE:
      return 'warning'
    case FunctionCategory.SUPPORT:
      return 'success'
    default:
      return 'default'
  }
}

/**
 * Get indentation for sub-KPIs based on parent
 */
function getIndentClass(kpi: MasterKPI): string {
  if (!kpi.parentKPIId) return ''
  return 'ml-6 border-l-2 border-muted-foreground/30'
}

export function MasterKpiTable({
  data,
  isLoading = false,
  totalPages = 0,
  totalRows = 0,
}: MasterKpiTableProps) {
  const [, setEditDialogOpen] = useAtom(editKpiDialogOpenAtom)
  const [, setDeleteDialogOpen] = useAtom(deleteKpiDialogOpenAtom)
  const [, setSelectedKpiForEdit] = useAtom(selectedKpiForEditAtom)
  const [, setSelectedKpiForDelete] = useAtom(selectedKpiForDeleteAtom)
  const [hierarchyFilter] = useAtom(kpiHierarchyFilterAtom)
  const [currentPage, setCurrentPage] = useAtom(kpiTablePageAtom)
  const [pageSize, setPageSize] = useAtom(kpiTablePageSizeAtom)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Filter data based on hierarchy filter
  const filteredData = useMemo(() => {
    let results = [...data]

    if (hierarchyFilter === 'parent') {
      results = results.filter((kpi) => !kpi.parentKPIId)
    } else if (hierarchyFilter === 'sub') {
      results = results.filter((kpi) => kpi.parentKPIId !== null)
    }

    return results
  }, [data, hierarchyFilter])

  const handleEdit = (kpi: MasterKPI) => {
    setSelectedKpiForEdit(mapKpiListItemToMasterKPI(kpi))
    setEditDialogOpen(true)
  }

  const handleDelete = (kpi: MasterKPI) => {
    setSelectedKpiForDelete(kpi)
    setDeleteDialogOpen(true)
  }

  const columns: ColumnDef<MasterKPI>[] = useMemo(
    () => [
      {
        id: 'code',
        accessorKey: 'code',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 font-semibold"
          >
            Code
            <ChevronDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-mono font-medium">{row.getValue('code')}</span>
        ),
      },
      {
        id: 'name',
        accessorKey: 'name',
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 font-semibold"
          >
            Name
            <ChevronDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => (
          <div className={getIndentClass(row.original)}>
            <p className="font-medium text-primary">{row.getValue('name')}</p>
            <p className="text-xs text-muted-foreground">
              {(row.original as MasterKPI).operationalDefinition}
            </p>
          </div>
        ),
      },
      {
        id: 'category',
        accessorKey: 'tags.functionCategory',
        header: 'Category',
        cell: ({ row }) => {
          const category = (row.original as MasterKPI).tags.functionCategory
          return (
            <Badge color={getCategoryColor(category)} variant="soft">
              {category}
            </Badge>
          )
        },
      },
      {
        id: 'tags',
        header: 'Compliance Tags',
        cell: ({ row }) => {
          const tags = (row.original as MasterKPI).tags.complianceTags
          return (
            <div className="flex gap-1 flex-wrap">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="soft"
                  color="info"
                  className="text-xs"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(row.original)}
              disabled={isLoading}
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              color="destructive"
              onClick={() => handleDelete(row.original)}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [isLoading],
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-muted/50 hover:bg-muted/50"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold">
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
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  No KPIs found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30 border-b">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {totalRows > 0 && (
        <KpiPaginationFooter
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalRows={totalRows}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  )
}
