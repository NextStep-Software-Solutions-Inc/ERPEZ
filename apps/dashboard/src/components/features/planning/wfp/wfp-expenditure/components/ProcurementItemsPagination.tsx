import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProcurementItemsPaginationProps {
  pageNumber: number
  totalPages: number
  onPageChange: (page: number) => void
  selectedCount: number
  totalFilteredCount: number
  pageSize: number
}

export function ProcurementItemsPagination({
  pageNumber,
  totalPages,
  onPageChange,
  selectedCount,
  totalFilteredCount,
  pageSize,
}: ProcurementItemsPaginationProps) {
  return (
    <div className="border-t px-6 py-3 flex items-center justify-between bg-gray-50">
      <div className="text-sm text-gray-600">
        {selectedCount > 0 && (
          <span className="font-medium">{selectedCount} selected</span>
        )}
        {selectedCount > 0 && totalFilteredCount > pageSize && (
          <span className="text-gray-400"> (showing {pageSize} per page)</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          Page {pageNumber} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, pageNumber - 1))}
          disabled={pageNumber === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, pageNumber + 1))}
          disabled={pageNumber === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
