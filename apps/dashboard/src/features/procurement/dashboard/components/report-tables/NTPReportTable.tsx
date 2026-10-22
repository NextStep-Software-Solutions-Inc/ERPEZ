import { useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useNTPReport } from '../../hooks/useProcurementDashboard'
import type { DashboardFiltersV2 } from '../../types/dashboardV2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface NTPReportTableProps {
  filters: DashboardFiltersV2
}

export function NTPReportTable({ filters }: NTPReportTableProps) {
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  const { data, isLoading } = useNTPReport({
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
          <CardTitle className="text-sm font-semibold">Notices to Proceed (NTP)</CardTitle>
          <CardDescription className="text-xs">Contract effectivity authorizations and delivery commencement milestones</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search NTP# or contract#..."
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
                <th className="p-3 font-semibold text-muted-foreground">NTP Number</th>
                <th className="p-3 font-semibold text-muted-foreground">Contract Number</th>
                <th className="p-3 font-semibold text-muted-foreground">Contractor / Supplier</th>
                <th className="p-3 font-semibold text-muted-foreground">Status</th>
                <th className="p-3 font-semibold text-muted-foreground">NTP Date</th>
                <th className="p-3 font-semibold text-muted-foreground">Effectivity Date</th>
                <th className="p-3 font-semibold text-muted-foreground">Completion Deadline</th>
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
                    No Notice to Proceed records found matching current criteria.
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-bold text-foreground">{row.ntpNumber}</td>
                    <td className="p-3 font-medium text-foreground">{row.contractNumber}</td>
                    <td className="p-3 text-muted-foreground">{row.supplierName}</td>
                    <td className="p-3"><Badge variant="secondary" className="text-[10px]">{row.status}</Badge></td>
                    <td className="p-3 text-muted-foreground">{row.ntpDate}</td>
                    <td className="p-3 text-muted-foreground">{row.effectivityDate || 'N/A'}</td>
                    <td className="p-3 font-semibold text-foreground">{row.deliveryCompletionDeadline || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
