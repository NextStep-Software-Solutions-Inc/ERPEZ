import { useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { usePRReport } from '../../hooks/useProcurementDashboard'
import type { DashboardFiltersV2 } from '../../types/dashboardV2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PRReportTableProps {
  filters: DashboardFiltersV2
}

function formatPHP(amount: number) {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function PRReportTable({ filters }: PRReportTableProps) {
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  const { data, isLoading } = usePRReport({
    ...filters,
    pageNumber,
    pageSize,
    searchTerm: searchTerm || undefined,
  })

  const items = data?.data || []
  const totalCount = data?.totalCount || 0
  const totalPages = data?.totalPages || 1

  return (
    <Card className="border border-border shadow-xs">
      <CardHeader className="p-4 pb-3 flex flex-row items-center justify-between border-b border-border/60">
        <div>
          <CardTitle className="text-sm font-semibold">Purchase Requests (PR) Report</CardTitle>
          <CardDescription className="text-xs">Comprehensive ledger of all individual office PR submissions</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search PR# or purpose..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPageNumber(1) }}
              className="h-8 text-xs pl-8"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 border-b border-border text-left">
              <tr>
                <th className="p-3 font-semibold text-muted-foreground">PR Number</th>
                <th className="p-3 font-semibold text-muted-foreground">Requesting Office</th>
                <th className="p-3 font-semibold text-muted-foreground">Purpose</th>
                <th className="p-3 font-semibold text-muted-foreground">Type</th>
                <th className="p-3 font-semibold text-muted-foreground text-right">Total Amount</th>
                <th className="p-3 font-semibold text-muted-foreground">Status</th>
                <th className="p-3 font-semibold text-muted-foreground">Date Requested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="p-4"><div className="h-4 bg-muted/40 animate-pulse rounded" /></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground text-xs">
                    No purchase request records matching current filters.
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-bold text-foreground">{row.prNumber}</td>
                    <td className="p-3 text-muted-foreground">{row.officeName}</td>
                    <td className="p-3 text-foreground line-clamp-1 max-w-xs">{row.purpose}</td>
                    <td className="p-3"><Badge variant="outline" className="text-[10px]">{row.prType}</Badge></td>
                    <td className="p-3 font-bold text-right text-foreground">{formatPHP(row.totalAmount)}</td>
                    <td className="p-3"><Badge variant="secondary" className="text-[10px]">{row.status}</Badge></td>
                    <td className="p-3 text-muted-foreground">{row.requestedDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {items.length} of {totalCount} records</span>
          <div className="flex items-center gap-2">
            <span>Page {pageNumber} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber((p) => p - 1)}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={pageNumber >= totalPages}
              onClick={() => setPageNumber((p) => p + 1)}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
