/**
 * KPI Selection Toolbar
 * Step 2: KPI Activation - Toolbar for KPI selection dialog
 * 
 * Features:
 * - Fiscal year selector (dropdown)
 * - Search by KPI name or code (left-aligned)
 * - Filter by function type, behaviour, and unit of measure
 * - Reset button to clear all filters
 * - Matches ActiveKPIsToolbar UI design
 */

import { Search, Loader2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MasterKPI } from '@/components/features/planning/annual-performance-planning/shared/utils/mockMasterKPIs'

interface FiscalYear {
  id: string
  name: string
  originalData?: any
}

export interface KPISelectionToolbarProps {
  masterKPIs: MasterKPI[]
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedFunctionType?: string | 'all'
  onFunctionTypeChange?: (value: string | 'all') => void
  selectedBehaviour?: string | 'all'
  onBehaviourChange?: (value: string | 'all') => void
  selectedUnit?: string | 'all'
  onUnitChange?: (value: string | 'all') => void
  fiscalYears?: FiscalYear[]
  selectedFiscalYearId?: string
  onFiscalYearChange?: (fiscalYearId: string) => void
  isLoadingFiscalYears?: boolean
  onResetFilters?: () => void
}

/**
 * Helper to format function type for display
 */
function formatFunctionType(value: string): string {
  return value
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/^ /, '')
}

export function KPISelectionToolbar({
  masterKPIs,
  searchTerm,
  onSearchChange,
  selectedFunctionType = 'all',
  onFunctionTypeChange,
  selectedBehaviour = 'all',
  onBehaviourChange,
  selectedUnit = 'all',
  onUnitChange,
  fiscalYears = [],
  selectedFiscalYearId = '',
  onFiscalYearChange,
  isLoadingFiscalYears = false,
  onResetFilters,
}: KPISelectionToolbarProps) {
  // Get unique function types
  const uniqueFunctionTypes = Array.from(
    new Set(masterKPIs.map(kpi => kpi.functionType).filter(Boolean))
  ).sort()

  // Get unique behaviours (defaultAggregation)
  const uniqueBehaviours = Array.from(
    new Set(masterKPIs.map(kpi => kpi.defaultAggregation).filter(Boolean))
  ).sort()

  // Get unique units of measure
  const uniqueUnits = Array.from(
    new Set(masterKPIs.map(kpi => kpi.unitOfMeasure).filter(Boolean))
  ).sort()

  const hasActiveFilters = searchTerm || selectedFiscalYearId || selectedFunctionType !== 'all' || selectedBehaviour !== 'all' || selectedUnit !== 'all'

  const handleResetFilters = () => {
    onSearchChange('')
    if (onFiscalYearChange) {
      onFiscalYearChange('')
    }
    if (onFunctionTypeChange) {
      onFunctionTypeChange('all')
    }
    if (onBehaviourChange) {
      onBehaviourChange('all')
    }
    if (onUnitChange) {
      onUnitChange('all')
    }
    if (onResetFilters) {
      onResetFilters()
    }
  }

  return (
    <div className="w-full space-y-3">
      {/* Top row: Search + Reset Button */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search KPIs by name or code..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 flex-shrink-0"
            title="Clear all filters"
          >
            <X className="w-4 h-4 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Filters row - Horizontal with overflow scroll capability */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end sm:flex-wrap lg:flex-nowrap">
        {/* Fiscal Year Filter */}
        <div className="flex-shrink-0 w-full sm:w-56 lg:w-auto">
          <label className="block text-xs font-medium text-gray-700 mb-1">Fiscal Year</label>
          {isLoadingFiscalYears ? (
            <div className="flex items-center gap-2 text-sm text-gray-600 h-10 px-3 border border-gray-300 rounded-md">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <Select value={selectedFiscalYearId || ''} onValueChange={(value) => {
              if (onFiscalYearChange) {
                onFiscalYearChange(value)
              }
            }}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent className="min-w-56">
                {fiscalYears.map(fy => (
                  <SelectItem key={fy.id} value={fy.id}>
                    {fy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Function Type Filter */}
        <div className="flex-shrink-0 w-full sm:w-56 lg:w-auto">
          <label className="block text-xs font-medium text-gray-700 mb-1">Function Type</label>
          <Select value={selectedFunctionType || 'all'} onValueChange={(value) => {
            if (onFunctionTypeChange) {
              onFunctionTypeChange(value === 'all' ? 'all' : value)
            }
          }}>
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent className="min-w-56">
              <SelectItem value="all">All Functions</SelectItem>
              {uniqueFunctionTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {formatFunctionType(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Behaviour Filter */}
        <div className="flex-shrink-0 w-full sm:w-56 lg:w-auto">
          <label className="block text-xs font-medium text-gray-700 mb-1">Behaviour</label>
          <Select value={selectedBehaviour || 'all'} onValueChange={(value) => {
            if (onBehaviourChange) {
              onBehaviourChange(value === 'all' ? 'all' : value)
            }
          }}>
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent className="min-w-56">
              <SelectItem value="all">All Behaviours</SelectItem>
              {uniqueBehaviours.map(behaviour => (
                <SelectItem key={behaviour} value={behaviour}>
                  {behaviour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Unit Filter */}
        <div className="flex-shrink-0 w-full sm:w-56 lg:w-auto">
          <label className="block text-xs font-medium text-gray-700 mb-1">Unit of Measure</label>
          <Select value={selectedUnit || 'all'} onValueChange={(value) => {
            if (onUnitChange) {
              onUnitChange(value === 'all' ? 'all' : value)
            }
          }}>
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent className="min-w-56">
              <SelectItem value="all">All Units</SelectItem>
              {uniqueUnits.map(unit => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
