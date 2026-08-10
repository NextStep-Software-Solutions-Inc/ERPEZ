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
import type { Department } from '../types'

interface DashboardFiltersProps {
  fiscalYear: number
  departmentId: string | null
  departments: Department[]
  showDepartmentFilter: boolean
  onFiscalYearChange: (year: number) => void
  onDepartmentChange: (departmentId: string | null) => void
}

/**
 * Generate fiscal year options (last 5 + current + next 5 years)
 */
function generateFiscalYearOptions(): number[] {
  const currentYear = new Date().getFullYear()
  const years: number[] = []

  for (let i = -5; i <= 5; i++) {
    years.push(currentYear + i)
  }

  return years
}

export function DashboardFilters({
  fiscalYear,
  departmentId,
  departments,
  showDepartmentFilter,
  onFiscalYearChange,
  onDepartmentChange,
}: DashboardFiltersProps) {
  const fiscalYearOptions = generateFiscalYearOptions()

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Fiscal Year Selector */}
      <div className="flex flex-col gap-2 min-w-[200px]">
        <Label htmlFor="fiscal-year" className="text-sm font-medium text-gray-700">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Fiscal Year
          </div>
        </Label>
        <Select
          value={fiscalYear.toString()}
          onValueChange={(value) => onFiscalYearChange(parseInt(value, 10))}
        >
          <SelectTrigger id="fiscal-year" className="w-full">
            <SelectValue placeholder="Select fiscal year" />
          </SelectTrigger>
          <SelectContent>
            {fiscalYearOptions.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                FY {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Department Selector (conditional rendering based on role) */}
      {showDepartmentFilter && (
        <div className="flex flex-col gap-2 min-w-[250px]">
          <Label htmlFor="department" className="text-sm font-medium text-gray-700">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Organization / Department
            </div>
          </Label>
          <Select
            value={departmentId || 'all'}
            onValueChange={(value) => onDepartmentChange(value === 'all' ? null : value)}
          >
            <SelectTrigger id="department" className="w-full">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Filter Summary (helpful for users) */}
      <div className="flex-1 min-w-[200px]">
        <div className="text-xs text-gray-500 mb-1">Active Filters</div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className="font-semibold">FY {fiscalYear}</span>
          {showDepartmentFilter && (
            <>
              <span className="text-gray-400">•</span>
              <span>
                {departmentId
                  ? departments.find((d) => d.id === departmentId)?.name || 'Selected Department'
                  : 'All Departments'}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
