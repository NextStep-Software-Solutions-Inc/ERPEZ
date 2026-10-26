import { useMemo } from 'react'
import { Filter, RotateCcw, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCalendarV2 } from '../contexts/calendar-context'
import type { ProcurementCategory } from '../../bidding-schedule/types'
import type { DerivedCalendarProjectStatus, ProcurementModeAbbr } from '../../bidding-master-calendar/types'
import { cn } from '@/lib/utils'

export function CalendarFiltersPopoverV2() {
  const { filters, setFilters, resetFilters, options } = useCalendarV2()

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.fiscalYears.length > 0) count++
    if (filters.offices.length > 0) count++
    if (filters.procurementCategories.length > 0) count += filters.procurementCategories.length
    if (filters.derivedStatuses.length > 0) count += filters.derivedStatuses.length
    if (filters.milestoneKeys.length > 0) count += filters.milestoneKeys.length
    if (filters.procurementModes && filters.procurementModes.length > 0) {
      count += filters.procurementModes.length
    }
    return count
  }, [filters])

  const toggleMode = (mode: ProcurementModeAbbr) => {
    setFilters((prev) => {
      const current = prev.procurementModes ?? []
      const exists = current.includes(mode)
      return {
        ...prev,
        procurementModes: exists
          ? current.filter((m) => m !== mode)
          : [...current, mode],
      }
    })
  }

  const toggleCategory = (cat: ProcurementCategory) => {
    setFilters((prev) => {
      const exists = prev.procurementCategories.includes(cat)
      return {
        ...prev,
        procurementCategories: exists
          ? prev.procurementCategories.filter((c) => c !== cat)
          : [...prev.procurementCategories, cat],
      }
    })
  }

  const toggleStatus = (status: DerivedCalendarProjectStatus) => {
    setFilters((prev) => {
      const exists = prev.derivedStatuses.includes(status)
      return {
        ...prev,
        derivedStatuses: exists
          ? prev.derivedStatuses.filter((s) => s !== status)
          : [...prev.derivedStatuses, status],
      }
    })
  }

  const MODES: Array<{ key: ProcurementModeAbbr; label: string; abbr: string; badgeClass: string }> = [
    { key: 'PB', label: 'Public Bidding', abbr: 'PB', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    { key: 'DA', label: 'Direct Acquisition', abbr: 'DA', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
    { key: 'DC', label: 'Direct Contracting', abbr: 'DC', badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    { key: 'RFQ', label: 'Request for Quotation / SVP', abbr: 'RFQ', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  ]

  const CATEGORIES: Array<{ key: ProcurementCategory; label: string }> = [
    { key: 'goods', label: 'Goods' },
    { key: 'infrastructure', label: 'Civil Works / Infra' },
    { key: 'consulting', label: 'Consulting Services' },
  ]

  const STATUSES: Array<{ key: DerivedCalendarProjectStatus; label: string; badgeClass: string }> = [
    { key: 'in-progress', label: 'In Progress', badgeClass: 'bg-blue-100 text-blue-800' },
    { key: 'due-soon', label: 'Due Soon (≤ 3 days)', badgeClass: 'bg-amber-100 text-amber-800' },
    { key: 'overdue', label: 'Overdue / Delayed', badgeClass: 'bg-red-100 text-red-800' },
    { key: 'completed-locked', label: 'Completed', badgeClass: 'bg-emerald-100 text-emerald-800' },
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-9 gap-1.5 px-3 rounded-lg border text-xs font-semibold select-none transition-colors',
            activeFilterCount > 0
              ? 'border-primary/50 bg-primary/5 text-primary'
              : 'border-border/60 hover:bg-muted',
          )}
        >
          <Filter className="h-3.5 w-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <Badge
              variant="default"
              className="ml-0.5 h-4 min-w-4 rounded-full px-1 text-[10px] font-bold"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-4 space-y-4 shadow-xl rounded-xl">
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-sm font-bold text-foreground">Calendar Filters</span>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>

        {/* Fiscal Year */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Fiscal Year</Label>
          <Select
            value={filters.fiscalYears[0] ?? 'all'}
            onValueChange={(val) =>
              setFilters((prev) => ({
                ...prev,
                fiscalYears: val === 'all' ? [] : [val],
              }))
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All Fiscal Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fiscal Years</SelectItem>
              {options.fiscalYearOptions.map((year) => (
                <SelectItem key={year} value={year}>
                  FY {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Office / End-User */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Implementing Office</Label>
          <Select
            value={filters.offices[0] ?? 'all'}
            onValueChange={(val) =>
              setFilters((prev) => ({
                ...prev,
                offices: val === 'all' ? [] : [val],
              }))
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All Offices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Offices</SelectItem>
              {options.officeOptions.map((office) => (
                <SelectItem key={office} value={office}>
                  {office}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Procurement Category */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Category</Label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(({ key, label }) => {
              const isSelected = filters.procurementCategories.includes(key)
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => toggleCategory(key)}
                  className={cn(
                    'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium border transition-colors cursor-pointer',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted',
                  )}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                  <span>{label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Procurement Mode */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Procurement Mode</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {MODES.map(({ key, label, abbr, badgeClass }) => {
              const isSelected = filters.procurementModes?.includes(key)
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => toggleMode(key)}
                  className={cn(
                    'flex items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium border transition-colors cursor-pointer',
                    isSelected
                      ? 'border-primary/60 bg-primary/10 text-primary font-semibold'
                      : 'border-border/60 hover:bg-muted/50 text-foreground',
                  )}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {isSelected && <Check className="h-3 w-3 text-primary shrink-0" />}
                    <span className="truncate">{abbr}</span>
                  </div>
                  <span className={cn('px-1 py-0.2 rounded text-[9px] font-bold shrink-0', badgeClass)}>
                    {abbr}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Status / Urgency */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Milestone Health</Label>
          <div className="flex flex-col gap-1">
            {STATUSES.map(({ key, label, badgeClass }) => {
              const isSelected = filters.derivedStatuses.includes(key)
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => toggleStatus(key)}
                  className={cn(
                    'flex items-center justify-between rounded-md px-2 py-1 text-xs font-medium border transition-colors cursor-pointer',
                    isSelected
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border/60 hover:bg-muted/50',
                  )}
                >
                  <span className="text-slate-700 dark:text-slate-200">{label}</span>
                  <span className={cn('h-2 w-2 rounded-full', badgeClass)} />
                </button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
