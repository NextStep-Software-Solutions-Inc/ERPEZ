import { Calendar } from 'lucide-react'
import OPCRCard from './OPCRCard'
import type { OPCR } from '@/features/planning/opcr/types/type.opcr'
import OPCRPaginationFooter from './OPCRPaginationFooter'

interface OPCRListViewProps {
  readonly opcrs: OPCR[]
  readonly onView: (opcr: OPCR) => void
  readonly pageNumber: number
  readonly pageSize: number
  readonly totalPageNumber: number
  readonly totalRows: number
  readonly onPageChange: (pageNumber: number) => void
  readonly onPageSizeChange: (pageSize: number) => void
}

export default function OPCRListView({
  opcrs,
  onView,
  pageNumber,
  pageSize,
  totalPageNumber,
  totalRows,
  onPageChange,
  onPageSizeChange,
}: OPCRListViewProps) {
  if (opcrs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-muted/30 dark:bg-slate-900/50 rounded-xl border border-border">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground">
          No OPCR records found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first OPCR to get started
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {opcrs.map((opcr) => (
          <OPCRCard key={opcr.id} opcr={opcr} onView={onView} />
        ))}
      </div>

      <OPCRPaginationFooter
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalPageNumber={totalPageNumber}
        totalRows={totalRows}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  )
}

