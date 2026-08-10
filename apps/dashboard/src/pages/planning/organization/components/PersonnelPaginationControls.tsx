import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PersonnelPaginationControlsProps {
  currentPage: number
  totalPages: number
  onPreviousPage: () => void
  onNextPage: () => void
  onPageSelect: (page: number) => void
  totalCount: number
  pageSize: number
}

export function PersonnelPaginationControls({
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
  onPageSelect,
  totalCount,
  pageSize,
}: PersonnelPaginationControlsProps) {
  return (
    <div className="flex items-center justify-between mt-6 pt-6 border-t border-default-200">
      <div className="text-xs font-medium text-default-500">
        {totalCount > 0 && (
          <span>
            Showing {Math.min((currentPage) * pageSize + 1, totalCount)} to{' '}
            {Math.min((currentPage + 1) * pageSize, totalCount)} of {totalCount} personnel
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 gap-1 font-medium text-xs"
          onClick={onPreviousPage}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Previous
        </Button>

        <div className="flex gap-1">
          {Array.from({ length: totalPages }).map((_, i) => (
            <Button
              key={i}
              variant={currentPage === i ? 'soft' : 'ghost'}
              size="sm"
              className={`h-8 w-8 p-0 font-semibold text-[10px] rounded-md transition-all ${
                currentPage === i
                  ? 'bg-primary text-primary-foreground'
                  : 'text-default-500 hover:text-default-900'
              }`}
              onClick={() => onPageSelect(i)}
            >
              {i + 1}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 gap-1 font-medium text-xs"
          onClick={onNextPage}
          disabled={currentPage >= totalPages - 1}
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
