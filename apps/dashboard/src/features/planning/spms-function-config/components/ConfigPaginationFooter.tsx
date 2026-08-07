import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ConfigPaginationFooterProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalRows: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function ConfigPaginationFooter({
  currentPage,
  totalPages,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
}: ConfigPaginationFooterProps) {
  const startRecord = (currentPage - 1) * pageSize + 1
  const endRecord = Math.min(currentPage * pageSize, totalRows)

  return (
    <div className="flex items-center justify-between gap-4 px-2 py-4 border-t mt-4">
      <div className="flex items-center gap-4">
        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-20 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Row Count Display */}
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {startRecord}-{endRecord} of {totalRows} records
        </span>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 w-9 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-sm font-medium min-w-max">
          Page {currentPage} of {totalPages}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
