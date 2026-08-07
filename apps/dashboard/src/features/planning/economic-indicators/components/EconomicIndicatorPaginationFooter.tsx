import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface EconomicIndicatorPaginationFooterProps {
  currentPage: number
  pageSize: number
  totalPages: number
  totalCount: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function EconomicIndicatorPaginationFooter({
  currentPage,
  pageSize,
  totalPages,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: EconomicIndicatorPaginationFooterProps) {
  const startRecord = (currentPage - 1) * pageSize + 1
  const endRecord = Math.min(currentPage * pageSize, totalCount)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t bg-slate-50/50">
      <div className="text-xs text-slate-600 font-medium">
        Showing {totalCount === 0 ? 0 : startRecord} to {endRecord} of{' '}
        {totalCount} indicators
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-medium">
            Items per page:
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => {
              onPageSizeChange(Number(val))
            }}
          >
            <SelectTrigger className="w-16 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-medium">
            Page {currentPage} of {totalPages || 1}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
