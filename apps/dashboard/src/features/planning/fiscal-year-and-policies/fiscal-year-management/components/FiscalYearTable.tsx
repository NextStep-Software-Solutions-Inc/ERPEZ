import { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Calendar1Icon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
} from 'lucide-react'
import type {
  FiscalYear,
  FiscalMonth,
} from '@/lib/fiscal-year-and-policies/types'
import { FiscalYearRow } from './FiscalYearRow'
import { FiscalYearRowActions } from './FiscalYearRowActions'

interface FiscalYearTableProps {
  fiscalYears: FiscalYear[]
  fiscalMonths: FiscalMonth[]
  expandedYearId: string | null
  loadingYearIds: Set<string>
  loadedYearIds: Set<string>
  currentPage: number
  onPageChange: (page: number) => void
  pageSize: number
  onPageSizeChange: (size: number) => void
  headerAction?: React.ReactNode
  onCreateInitiate: () => void
  onStatusChange: (
    fiscalYear: FiscalYear,
    newStatus: FiscalYear['status'],
  ) => void
  onExpandClick: (yearId: string) => void
  onMonthLockToggle: (monthId: string, fiscalYearId: string) => void
  onEdit: (fiscalYear: FiscalYear) => void
  onDelete: (fiscalYear: FiscalYear) => void
}

/**
 * Table component for displaying all fiscal years with expandable months, pagination, and row actions
 */
export function FiscalYearTable({
  fiscalYears,
  fiscalMonths,
  expandedYearId,
  loadingYearIds,
  loadedYearIds,
  currentPage,
  onPageChange,
  pageSize,
  onPageSizeChange,
  headerAction,
  onCreateInitiate,
  onStatusChange,
  onExpandClick,
  onMonthLockToggle,
  onEdit,
  onDelete,
}: FiscalYearTableProps) {
  // Calculate paginated data
  const { paginatedData, totalPages } = useMemo(() => {
    const total = Math.ceil(fiscalYears.length / pageSize) || 1 // Ensure at least 1 page
    const startIdx = (currentPage - 1) * pageSize
    const endIdx = startIdx + pageSize
    return {
      paginatedData: fiscalYears.slice(startIdx, endIdx),
      totalPages: total,
    }
  }, [fiscalYears, currentPage, pageSize])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar1Icon className="h-5 w-5" />
              Fiscal Year Management
            </CardTitle>
            <CardDescription>
              Create and manage fiscal years, set their status, and control
              month locking
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {headerAction}
            <Button onClick={onCreateInitiate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Fiscal Year
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="flex justify-between items-center">
                <TableCell className="flex-1">Fiscal Year</TableCell>
                <TableCell className="shrink-0 w-40">Status</TableCell>
                <TableCell className="shrink-0 w-48">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground py-8"
                  >
                    No fiscal years created yet
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((fiscalYear) => (
                  <FiscalYearRow
                    key={fiscalYear.id}
                    fiscalYear={fiscalYear}
                    isExpanded={expandedYearId === fiscalYear.id}
                    isLoading={loadingYearIds.has(fiscalYear.id)}
                    isLoaded={loadedYearIds.has(fiscalYear.id)}
                    months={fiscalMonths.filter(
                      (fm) => fm.fiscalYearId === fiscalYear.id,
                    )}
                    allFiscalYears={fiscalYears}
                    onStatusChange={onStatusChange}
                    onExpandClick={onExpandClick}
                    onMonthLockToggle={(monthId) =>
                      onMonthLockToggle(monthId, fiscalYear.id)
                    }
                    rowActions={
                      <FiscalYearRowActions
                        fiscalYear={fiscalYear}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    }
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls - Dashtail Design */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t px-2 py-4 lg:gap-8">
          {/* Left: Page Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Rows per page:
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="40">40</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Center: Page Info */}
          <div className="flex w-[100px] items-center justify-center text-sm font-medium text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>

          {/* Right: Navigation Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="hidden h-8 w-8 p-0 lg:flex"
            >
              <ChevronsLeft className="h-4 w-4 rtl:rotate-180" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="hidden h-8 w-8 p-0 lg:flex"
            >
              <ChevronsRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
