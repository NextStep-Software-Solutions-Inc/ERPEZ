import { useEffect, useState } from 'react'
import { Calendar, Filter, RotateCcw, SlidersHorizontal, X } from 'lucide-react'
import type { DashboardFiltersV2 } from '../types/dashboardV2'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { api } from '@/services/api'

interface GlobalFilterBarProps {
  filters: DashboardFiltersV2
  onChange: (filters: DashboardFiltersV2) => void
  onJumpToReports?: () => void
  activeOfficeName?: string
}

interface OfficeOption {
  id: string
  name: string
  code?: string
}

export function GlobalFilterBar({ filters, onChange }: GlobalFilterBarProps) {
  const [offices, setOffices] = useState<Array<OfficeOption>>([])
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  useEffect(() => {
    let isMounted = true
    api.get<any>('/offices')
      .then((res) => {
        if (!isMounted) return
        const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : [])
        setOffices(list)
      })
      .catch((err) => console.error('Failed to load offices for filter bar', err))
    return () => { isMounted = false }
  }, [])

  const currentYear = new Date().getFullYear()
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1]

  const handleFYChange = (val: string) => {
    onChange({ ...filters, fiscalYear: parseInt(val, 10) })
  }

  const handleQuarterChange = (val: string) => {
    onChange({ ...filters, quarter: val === 'all' ? undefined : parseInt(val, 10) })
  }

  const handleOfficeChange = (val: string) => {
    onChange({ ...filters, officeId: val === 'all' ? undefined : val })
  }

  const handleModeChange = (val: string) => {
    onChange({ ...filters, procurementMode: val === 'all' ? undefined : val })
  }

  const handleStatusChange = (val: string) => {
    onChange({ ...filters, status: val === 'all' ? undefined : val })
  }

  const handleReset = () => {
    onChange({
      fiscalYear: currentYear,
      officeId: undefined,
      quarter: undefined,
      procurementMode: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      status: undefined,
    })
  }

  const handleClearAdvanced = () => {
    onChange({
      ...filters,
      quarter: undefined,
      procurementMode: undefined,
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    })
  }

  const activeAdvancedCount = [
    filters.quarter,
    filters.procurementMode,
    filters.status,
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length

  const totalActiveCount = [
    filters.officeId,
    filters.quarter,
    filters.procurementMode,
    filters.status,
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length

  return (
    <div className="bg-card/90 backdrop-blur-xs border border-border/80 rounded-xl py-1.5 px-3.5 shadow-xs mb-4">
      <div className="flex flex-wrap items-center gap-2">
        {/* Compact Label */}
        <div className="flex items-center gap-1.5 text-muted-foreground shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-bold tracking-wider uppercase">Filters</span>
          {totalActiveCount > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 min-w-[18px] flex items-center justify-center font-bold bg-primary/10 text-primary">
              {totalActiveCount}
            </Badge>
          )}
        </div>

        {/* Core Filter: Fiscal Year */}
        <div className="w-[96px]">
          <Select value={filters.fiscalYear.toString()} onValueChange={handleFYChange}>
            <SelectTrigger className="h-8 text-xs font-medium">
              <SelectValue placeholder="FY" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()} className="text-xs">
                  FY {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Core Filter: Office */}
        <div className="w-[170px]">
          <Select value={filters.officeId || 'all'} onValueChange={handleOfficeChange}>
            <SelectTrigger className="h-8 text-xs truncate">
              <SelectValue placeholder="All Offices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Offices</SelectItem>
              {offices.map((o) => (
                <SelectItem key={o.id} value={o.id} className="text-xs truncate">
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters Popover */}
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={activeAdvancedCount > 0 ? "secondary" : "outline"}
              size="sm"
              className={`h-8 px-2.5 text-xs gap-1.5 ${
                activeAdvancedCount > 0 ? 'border-primary/40 font-medium text-foreground' : 'text-muted-foreground'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>More Filters</span>
              {activeAdvancedCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                  {activeAdvancedCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[340px] p-3.5 shadow-xl border-border bg-card">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Advanced Filters</span>
                </div>
                {activeAdvancedCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAdvanced}
                    className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>

              {/* Quarter & Status */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground">Quarter</Label>
                  <Select
                    value={filters.quarter ? filters.quarter.toString() : 'all'}
                    onValueChange={handleQuarterChange}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Quarter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">All Quarters</SelectItem>
                      <SelectItem value="1" className="text-xs">Q1 (Jan-Mar)</SelectItem>
                      <SelectItem value="2" className="text-xs">Q2 (Apr-Jun)</SelectItem>
                      <SelectItem value="3" className="text-xs">Q3 (Jul-Sep)</SelectItem>
                      <SelectItem value="4" className="text-xs">Q4 (Oct-Dec)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground">Status</Label>
                  <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                      <SelectItem value="Draft" className="text-xs">Draft</SelectItem>
                      <SelectItem value="Submitted" className="text-xs">Submitted</SelectItem>
                      <SelectItem value="Approved" className="text-xs">Approved</SelectItem>
                      <SelectItem value="Completed" className="text-xs">Completed</SelectItem>
                      <SelectItem value="Failed" className="text-xs">Failed</SelectItem>
                      <SelectItem value="Returned" className="text-xs">Returned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Procurement Mode */}
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-muted-foreground">Procurement Mode</Label>
                <Select value={filters.procurementMode || 'all'} onValueChange={handleModeChange}>
                  <SelectTrigger className="h-8 text-xs truncate">
                    <SelectValue placeholder="All Modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Modes</SelectItem>
                    <SelectItem value="Competitive Bidding" className="text-xs">Competitive Bidding</SelectItem>
                    <SelectItem value="Limited Source Bidding" className="text-xs">Limited Source Bidding</SelectItem>
                    <SelectItem value="Direct Contracting" className="text-xs">Direct Contracting</SelectItem>
                    <SelectItem value="Repeat Order" className="text-xs">Repeat Order</SelectItem>
                    <SelectItem value="Shopping" className="text-xs">Shopping</SelectItem>
                    <SelectItem value="Small Value Procurement" className="text-xs">Small Value Procurement</SelectItem>
                    <SelectItem value="Negotiated Procurement" className="text-xs">Negotiated Procurement</SelectItem>
                    <SelectItem value="Direct Acquisition" className="text-xs">Direct Acquisition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Custom Date Range
                </Label>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="date"
                    className="h-8 text-xs px-2 flex-1"
                    value={filters.dateFrom || ''}
                    onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || undefined })}
                  />
                  <span className="text-xs text-muted-foreground">-</span>
                  <Input
                    type="date"
                    className="h-8 text-xs px-2 flex-1"
                    value={filters.dateTo || ''}
                    onChange={(e) => onChange({ ...filters, dateTo: e.target.value || undefined })}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Reset button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-8 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
          disabled={totalActiveCount === 0 && filters.fiscalYear === currentYear}
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </Button>
      </div>
    </div>
  )
}
