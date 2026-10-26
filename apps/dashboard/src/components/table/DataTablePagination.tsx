import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface DataTablePaginationProps<TData> {
  table?: Table<TData>
  pageIndex?: number
  pageSize?: number
  totalCount?: number
  pageCount?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  className?: string
  showSelectedCount?: boolean
}

export function DataTablePagination<TData>({
  table,
  pageIndex: propPageIndex,
  pageSize: propPageSize,
  totalCount: propTotalCount,
  pageCount: propPageCount,
  onPageChange: propOnPageChange,
  onPageSizeChange: propOnPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50, 100],
  className,
  showSelectedCount = true,
}: DataTablePaginationProps<TData>) {
  // Determine state from table instance or props
  const pageIndex = table
    ? table.getState().pagination.pageIndex
    : (propPageIndex ?? 0)

  const pageSize = table
    ? table.getState().pagination.pageSize
    : (propPageSize ?? 10)

  const totalCount =
    propTotalCount !== undefined
      ? propTotalCount
      : table
        ? table.getFilteredRowModel().rows.length
        : 0

  const pageCount =
    propPageCount !== undefined
      ? propPageCount
      : table
        ? table.getPageCount()
        : Math.ceil(totalCount / pageSize) || 1

  const selectedCount = table
    ? table.getFilteredSelectedRowModel().rows.length
    : 0

  const canPreviousPage = table
    ? table.getCanPreviousPage()
    : pageIndex > 0

  const canNextPage = table
    ? table.getCanNextPage()
    : pageIndex < pageCount - 1

  const handlePageChange = (newIndex: number) => {
    if (table) {
      table.setPageIndex(newIndex)
    }
    propOnPageChange?.(newIndex)
  }

  const handlePageSizeChange = (newSize: number) => {
    if (table) {
      table.setPageSize(newSize)
    }
    propOnPageSizeChange?.(newSize)
  }

  const startRow = totalCount === 0 ? 0 : pageIndex * pageSize + 1
  const endRow = Math.min((pageIndex + 1) * pageSize, totalCount)

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-3.5 border-t border-border bg-card/50 text-xs text-muted-foreground',
        className,
      )}
    >
      <div className="flex items-center gap-4">
        {showSelectedCount && selectedCount > 0 ? (
          <div>
            <span className="font-semibold text-foreground">{selectedCount}</span> of{' '}
            <span className="font-semibold text-foreground">{totalCount}</span> row(s) selected
          </div>
        ) : (
          <div>
            {totalCount === 0 ? (
              'No results'
            ) : (
              <>
                Showing <span className="font-semibold text-foreground">{startRow}</span> to{' '}
                <span className="font-semibold text-foreground">{endRow}</span> of{' '}
                <span className="font-semibold text-foreground">{totalCount}</span> results
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 lg:gap-6">
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap">Per page</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => handlePageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[72px] text-xs">
              <SelectValue placeholder={`${pageSize}`} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`} className="text-xs">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-center font-medium">
          Page {totalCount === 0 ? 0 : pageIndex + 1} of {Math.max(1, pageCount)}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => handlePageChange(0)}
            disabled={!canPreviousPage}
            title="First page"
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(pageIndex - 1)}
            disabled={!canPreviousPage}
            title="Previous page"
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(pageIndex + 1)}
            disabled={!canNextPage}
            title="Next page"
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => handlePageChange(pageCount - 1)}
            disabled={!canNextPage}
            title="Last page"
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
