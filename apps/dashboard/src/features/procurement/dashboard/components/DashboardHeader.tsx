import { Building2, Calendar } from 'lucide-react'
import type { Department } from '../types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface ProcurementDashboardHeaderProps {
  fiscalYear: number
  departmentId: string | null
  departments: Array<Department>
  showDepartmentFilter: boolean
  onFiscalYearChange: (year: number) => void
  onDepartmentChange: (departmentId: string | null) => void
}

function generateFiscalYearOptions(): Array<number> {
  const currentYear = new Date().getFullYear()
  const years: Array<number> = []
  for (let i = -5; i <= 5; i++) {
    years.push(currentYear + i)
  }
  return years
}

export function ProcurementDashboardHeader({
  fiscalYear,
  departmentId,
  departments,
  showDepartmentFilter,
  onFiscalYearChange,
  onDepartmentChange,
}: ProcurementDashboardHeaderProps) {
  const fiscalYearOptions = generateFiscalYearOptions()

  const selectedDept = departments.find((d) => d.id === departmentId)
  const viewingLabel = departmentId ? (selectedDept?.name ?? departmentId) : 'All Departments'

  return (
    <div className="flex flex-wrap items-end justify-between gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Filters row */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Fiscal Year */}
        <div className="flex flex-col gap-2 min-w-[200px]">
          <Label htmlFor="proc-fiscal-year" className="text-sm font-medium text-gray-700">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fiscal Year
            </div>
          </Label>
          <Select
            value={fiscalYear.toString()}
            onValueChange={(value) => onFiscalYearChange(parseInt(value, 10))}
          >
            <SelectTrigger id="proc-fiscal-year" className="w-full">
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

        {/* Department (admin only) */}
        {showDepartmentFilter && (
          <div className="flex flex-col gap-2 min-w-[250px]">
            <Label htmlFor="proc-department" className="text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Organization / Department
              </div>
            </Label>
            <Select
              value={departmentId ?? 'all'}
              onValueChange={(value) => onDepartmentChange(value === 'all' ? null : value)}
            >
              <SelectTrigger id="proc-department" className="w-full">
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

      {/* Role banner */}
      <div className="flex items-center gap-2 self-end">
        <Building2 className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">Viewing:</span>
        <Badge variant="outline" className="text-xs font-semibold">
          {viewingLabel}
        </Badge>
      </div>
    </div>
  )
}
