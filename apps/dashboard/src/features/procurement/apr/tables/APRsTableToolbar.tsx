/**
 * APRs Table Toolbar with Filters
 * Search, Status filter, Fiscal Year selector (live API integrated)
 */

import { useMemo } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import { useFiscalYears } from '../handlers/hooks'

interface APRsTableToolbarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  status: string
  onStatusChange: (status: string) => void
  fiscalYear: number
  onFiscalYearChange: (year: number) => void
  onCreateClick: () => void
}

export function APRsTableToolbar({
  searchTerm,
  onSearchChange,
  status,
  onStatusChange,
  fiscalYear,
  onFiscalYearChange,
  onCreateClick,
}: APRsTableToolbarProps) {
  const { data: fiscalYearsResponse } = useFiscalYears({})

  const fiscalYears = useMemo(() => {
    if (!fiscalYearsResponse) return []
    if (Array.isArray(fiscalYearsResponse)) return fiscalYearsResponse
    if (Array.isArray((fiscalYearsResponse as any).data)) return (fiscalYearsResponse as any).data
    if (Array.isArray((fiscalYearsResponse as any).items)) return (fiscalYearsResponse as any).items
    return []
  }, [fiscalYearsResponse])

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
      <div className="flex flex-1 flex-wrap gap-2.5">
        <Input
          placeholder="Search APRs..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-64 bg-background"
        />

        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-40 bg-background">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SUBMITTED">Submitted</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="RETURNED">Returned</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={fiscalYear ? fiscalYear.toString() : ''}
          onValueChange={(v) => onFiscalYearChange(parseInt(v, 10))}
        >
          <SelectTrigger className="w-44 bg-background">
            <SelectValue placeholder="Select fiscal year" />
          </SelectTrigger>
          <SelectContent>
            {fiscalYears.length > 0 ? (
              fiscalYears.map((fy: any) => (
                <SelectItem key={fy.id || fy.year} value={fy.year.toString()}>
                  <div className="flex items-center justify-between w-full gap-2">
                    <span>FY {fy.year}</span>
                    {fy.status && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] py-0 h-4 capitalize ${
                          fy.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/35'
                            : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {fy.status}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))
            ) : (
              <SelectItem value={fiscalYear.toString()}>
                FY {fiscalYear}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onCreateClick} size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Create APR
      </Button>
    </div>
  )
}
