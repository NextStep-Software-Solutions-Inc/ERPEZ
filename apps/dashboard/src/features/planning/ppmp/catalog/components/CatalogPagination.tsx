/**
 * CatalogPagination
 * Page navigation and page-size selector for the catalog table.
 */

import { useAtom } from 'jotai'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import type { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { catalogPaginationAtom } from '../atoms/catalogTableAtom'
import type { NonCseCatalogItem } from '../types'

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

interface CatalogPaginationProps {
  table: Table<NonCseCatalogItem>
  total: number
  isLoading: boolean
}

export function CatalogPagination({
  table,
  total,
  isLoading,
}: CatalogPaginationProps) {
  const [pagination, setPagination] = useAtom(catalogPaginationAtom)
  const { pageIndex, pageSize } = pagination
  const pageCount = table.getPageCount()

  const from = total === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, total)

  return (
    <div className="flex items-center justify-between text-sm">
      {/* Record range */}
      <span className="text-muted-foreground text-xs">
        {total === 0
          ? 'No records'
          : `${from}–${to} of ${total.toLocaleString()} items`}
      </span>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) =>
              setPagination({ pageIndex: 0, pageSize: Number(val) })
            }
            disabled={isLoading}
          >
            <SelectTrigger className="h-7 w-[65px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)} className="text-xs">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setPagination({ ...pagination, pageIndex: 0 })}
            disabled={pageIndex === 0 || isLoading}
            aria-label="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() =>
              setPagination({ ...pagination, pageIndex: pageIndex - 1 })
            }
            disabled={pageIndex === 0 || isLoading}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-xs text-muted-foreground px-1 select-none">
            {pageIndex + 1} / {pageCount || 1}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() =>
              setPagination({ ...pagination, pageIndex: pageIndex + 1 })
            }
            disabled={pageIndex >= pageCount - 1 || isLoading}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() =>
              setPagination({ ...pagination, pageIndex: pageCount - 1 })
            }
            disabled={pageIndex >= pageCount - 1 || isLoading}
            aria-label="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
