import { useEffect, useState } from 'react'
import { Activity, Building, Calendar, Filter, Layers, RotateCcw } from 'lucide-react'
import type { DashboardFiltersV2 } from '../types/dashboardV2'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { api } from '@/services/api'

interface GlobalFilterBarProps {
  filters: DashboardFiltersV2
  onChange: (filters: DashboardFiltersV2) => void
}

interface OfficeOption {
  id: string
  name: string
  code?: string
}

export function GlobalFilterBar({ filters, onChange }: GlobalFilterBarProps) {
  const [offices, setOffices] = useState<Array<OfficeOption>>([])

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

  const activeFilterCount = [
    filters.quarter,
    filters.officeId,
    filters.procurementMode,
    filters.dateFrom,
    filters.dateTo,
    filters.status,
  ].filter(Boolean).length

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-wide">GLOBAL PROCUREMENT FILTERS</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  {activeFilterCount} active
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Filter all dashboard widgets, metrics, and pipeline stages</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Fiscal Year */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select value={filters.fiscalYear.toString()} onValueChange={handleFYChange}>
              <SelectTrigger className="w-[110px] h-9 text-xs font-medium">
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

          {/* Quarter */}
          <Select value={filters.quarter ? filters.quarter.toString() : 'all'} onValueChange={handleQuarterChange}>
            <SelectTrigger className="w-[110px] h-9 text-xs">
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

          {/* Office / Department */}
          <div className="flex items-center gap-1.5">
            <Building className="w-4 h-4 text-muted-foreground" />
            <Select value={filters.officeId || 'all'} onValueChange={handleOfficeChange}>
              <SelectTrigger className="w-[180px] h-9 text-xs">
                <SelectValue placeholder="Office / Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Offices</SelectItem>
                {offices.map((o) => (
                  <SelectItem key={o.id} value={o.id} className="text-xs">
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Procurement Mode */}
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-muted-foreground" />
            <Select value={filters.procurementMode || 'all'} onValueChange={handleModeChange}>
              <SelectTrigger className="w-[160px] h-9 text-xs">
                <SelectValue placeholder="Procurement Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Modes</SelectItem>
                <SelectItem value="bidding" className="text-xs">Public Bidding</SelectItem>
                <SelectItem value="shopping" className="text-xs">Shopping / SVP</SelectItem>
                <SelectItem value="direct-contracting" className="text-xs">Direct Contracting</SelectItem>
                <SelectItem value="direct-acquisition" className="text-xs">Direct Acquisition</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                <SelectItem value="Draft" className="text-xs">Draft</SelectItem>
                <SelectItem value="Submitted" className="text-xs">Submitted</SelectItem>
                <SelectItem value="Approved" className="text-xs">Approved</SelectItem>
                <SelectItem value="Completed" className="text-xs">Completed</SelectItem>
                <SelectItem value="Returned" className="text-xs">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date range inputs */}
          <div className="flex items-center gap-1">
            <Input
              type="date"
              className="w-[135px] h-9 text-xs px-2"
              value={filters.dateFrom || ''}
              onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || undefined })}
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="date"
              className="w-[135px] h-9 text-xs px-2"
              value={filters.dateTo || ''}
              onChange={(e) => onChange({ ...filters, dateTo: e.target.value || undefined })}
            />
          </div>

          {/* Reset button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-9 px-3 text-xs gap-1.5"
            disabled={activeFilterCount === 0 && filters.fiscalYear === currentYear}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
