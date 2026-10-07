/**
 * Active KPIs Toolbar
 * Step 2: KPI Activation - Toolbar for active KPIs table
 */

import { Search, Plus, Loader2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { usePermissions } from '@/hooks/usePermissions'
import { PERMISSIONS } from '@/constants/permissions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FiscalYear {
  id: string
  name: string
}

interface ActiveKPIsToolbarProps {
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
  onAddKPI: () => void
  fiscalYears?: FiscalYear[]
  selectedFiscalYearId?: string
  onFiscalYearChange?: (fiscalYearId: string) => void
  onClearFiscalYear?: () => void
  isLoadingKPIs?: boolean
  isLoadingFiscalYears?: boolean
}

export function ActiveKPIsToolbar({
  globalFilter,
  onGlobalFilterChange,
  onAddKPI,
  fiscalYears = [],
  selectedFiscalYearId,
  onFiscalYearChange,
  onClearFiscalYear,
  isLoadingKPIs = false,
  isLoadingFiscalYears = false,
}: ActiveKPIsToolbarProps) {
  const { hasPermission } = usePermissions()
  const canManageTargets = hasPermission(PERMISSIONS.Planning.Target.Manage)

  return (
    <div className="w-full flex items-center gap-3">
      {/* Search Input - Left side */}
      <div className="relative max-w-sm flex-shrink-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search KPIs..."
          value={globalFilter}
          onChange={(e) => onGlobalFilterChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Fiscal Year Dropdown & Clear Button */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isLoadingFiscalYears ? (
          <div className="w-52 flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading fiscal years...</span>
          </div>
        ) : fiscalYears && fiscalYears.length > 0 ? (
          <>
            <Select
              value={selectedFiscalYearId || 'all'}
              onValueChange={(value) => {
                if (value === 'all') {
                  onClearFiscalYear?.()
                } else if (value && onFiscalYearChange) {
                  onFiscalYearChange(value)
                }
              }}
            >
              <SelectTrigger className="w-52">
                <SelectValue placeholder="All Fiscal Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fiscal Years</SelectItem>
                {fiscalYears.map((fy) => (
                  <SelectItem key={fy.id} value={fy.id}>
                    {fy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedFiscalYearId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onClearFiscalYear?.()}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-9 w-9 p-0"
                title="Clear fiscal year selection"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </>
        ) : null}
      </div>

      {/* Spacer to push button to right */}
      <div className="flex-1" />

      {/* Add KPI Button - Far right side */}
      {canManageTargets && (
        <div className="flex-shrink-0">
          <Button
            type="button"
            onClick={onAddKPI}
            disabled={isLoadingKPIs || !selectedFiscalYearId}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400"
            title={!selectedFiscalYearId ? 'Please select a fiscal year first' : ''}
          >
            {isLoadingKPIs ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading KPIs...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Active KPI
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
