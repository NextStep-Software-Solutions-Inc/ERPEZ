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
