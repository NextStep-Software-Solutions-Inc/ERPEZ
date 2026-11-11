/**
 * Dashboard Filters Component
 * 
 * Global filters for fiscal year and organization/department selection.
 * Department filter visibility controlled by user role (Planning User only).
 * 
 * @module features/planning/dashboard/components/DashboardFilters
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Calendar, Building2 } from 'lucide-react'
import type { Department, FiscalYearOption } from '../types'

interface DashboardFiltersProps {
  fiscalYear: number
  fiscalYears?: FiscalYearOption[]
  departmentId: string | null
  departments: Department[]
  showDepartmentFilter: boolean
  onFiscalYearChange: (year: number) => void
  onDepartmentChange: (departmentId: string | null) => void
}

export function DashboardFilters({
  fiscalYear,
  fiscalYears = [],
  departmentId,
  departments,
  showDepartmentFilter,
  onFiscalYearChange,
  onDepartmentChange,
}: DashboardFiltersProps) {
  // If fiscalYears are supplied from DB, use them; otherwise fallback to [fiscalYear]
  const availableYears = fiscalYears.length > 0
    ? fiscalYears.map((fy) => fy.year).sort((a, b) => b - a)
    : [fiscalYear]

  return (
    <div className="flex flex-wrap items-end gap-4 p-3.5 sm:p-4 bg-card border border-border/80 rounded-xl shadow-xs">
      {/* Fiscal Year Selector */}
      <div className="flex flex-col gap-1.5 min-w-[180px] sm:min-w-[200px]">
        <Label htmlFor="fiscal-year" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            Fiscal Year
          </div>
        </Label>
        <Select
          value={fiscalYear.toString()}
          onValueChange={(value) => onFiscalYearChange(parseInt(value, 10))}
        >
          <SelectTrigger id="fiscal-year" className="w-full h-9 bg-background/80 dark:bg-slate-900/60 border-border text-foreground font-medium">
            <SelectValue placeholder="Select fiscal year" />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                FY {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Department Selector (conditional rendering based on role) */}
      {showDepartmentFilter && (
        <div className="flex flex-col gap-1.5 min-w-[230px] sm:min-w-[260px]">
          <Label htmlFor="department" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Organization / Department
            </div>
          </Label>
          <Select
            value={departmentId || 'all'}
            onValueChange={(value) => onDepartmentChange(value === 'all' ? null : value)}
          >
            <SelectTrigger id="department" className="w-full h-9 bg-background/80 dark:bg-slate-900/60 border-border text-foreground font-medium">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
