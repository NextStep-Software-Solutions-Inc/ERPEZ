/**
 * Master KPI Advanced Filters Component
 * Consolidated filtering UI for high-granularity KPI selection
 */

import { Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Table } from '@tanstack/react-table'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'
import { KpiLibrarySearchParams } from '@/routes/v2/kpi-library/constants'
import { masterKpiTargetDistributionOptions } from '../utils/masterKpiListFilters'

interface FilterOption {
  value: string
  label: string
}

interface FilterSectionProps {
  title: string
  columnId: string
  options: FilterOption[]
  selectedValues: Set<string>
  onToggle: (columnId: string, value: string) => void
}

function FilterSection({
  title,
  columnId,
  options,
  selectedValues,
  onToggle,
}: FilterSectionProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90 px-1">
        {title}
      </h4>
      <div className="space-y-1.5">
        {options.map((option) => {
          const isSelected = selectedValues.has(option.value)
          return (
            <div
              key={option.value}
              className={cn(
                'flex items-center space-x-2.5 rounded-md px-2.5 py-2 transition-all duration-150 cursor-pointer hover:bg-muted/60',
                isSelected
                  ? 'bg-primary/8 ring-1 ring-primary/20'
                  : 'bg-muted/30 hover:bg-muted/50',
              )}
              onClick={() => onToggle(columnId, option.value)}
            >
              <Checkbox
                id={`${columnId}-${option.value}`}
                checked={isSelected}
                onCheckedChange={() => {}}
                className="pointer-events-none"
              />
              <Label
                htmlFor={`${columnId}-${option.value}`}
                className="text-xs font-medium leading-none cursor-pointer flex-1 py-0.5"
              >
                {option.label}
              </Label>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const functionCategoryOptions = [
  { label: 'Strategic', value: 'Strategic' },
  { label: 'Core', value: 'Core' },
  { label: 'Support', value: 'Support' },
]

const isOptInOptions = [
  { label: 'Opt-In (Available)', value: 'true' },
  { label: 'Mandatory (Restricted)', value: 'false' },
]

const measurementUnitOptions = [
  { label: 'Number / Count', value: 'Number/Count' },
  { label: 'Percentage (%)', value: 'Percentage (%)' },
]

const targetDistributionOptions = [...masterKpiTargetDistributionOptions]

const sdgOptions = [
  { label: 'SDG 1: No Poverty', value: 'SDG 1: No Poverty' },
  { label: 'SDG 2: Zero Hunger', value: 'SDG 2: Zero Hunger' },
  {
    label: 'SDG 3: Good Health and Well-being',
    value: 'SDG 3: Good Health and Well-being',
  },
  { label: 'SDG 4: Quality Education', value: 'SDG 4: Quality Education' },
  { label: 'SDG 5: Gender Equality', value: 'SDG 5: Gender Equality' },
  {
    label: 'SDG 6: Clean Water and Sanitation',
    value: 'SDG 6: Clean Water and Sanitation',
  },
  {
    label: 'SDG 7: Affordable and Clean Energy',
    value: 'SDG 7: Affordable and Clean Energy',
  },
  {
    label: 'SDG 8: Decent Work and Economic Growth',
    value: 'SDG 8: Decent Work and Economic Growth',
  },
  {
    label: 'SDG 9: Industry, Innovation, and Infrastructure',
    value: 'SDG 9: Industry, Innovation, and Infrastructure',
  },
  {
    label: 'SDG 10: Reduced Inequalities',
    value: 'SDG 10: Reduced Inequalities',
  },
  {
    label: 'SDG 11: Sustainable Cities and Communities',
    value: 'SDG 11: Sustainable Cities and Communities',
  },
  {
    label: 'SDG 12: Responsible Consumption and Production',
    value: 'SDG 12: Responsible Consumption and Production',
  },
  { label: 'SDG 13: Climate Action', value: 'SDG 13: Climate Action' },
  { label: 'SDG 14: Life Below Water', value: 'SDG 14: Life Below Water' },
  { label: 'SDG 15: Life on Land', value: 'SDG 15: Life on Land' },
  {
    label: 'SDG 16: Peace, Justice and Strong Institutions',
    value: 'SDG 16: Peace, Justice and Strong Institutions',
  },
  {
    label: 'SDG 17: Partnerships for the Goals',
    value: 'SDG 17: Partnerships for the Goals',
  },
]

interface MasterKpiAdvancedFiltersProps {
  table: Table<any>
}

const columnIdMap: Record<string, string> = {
  kpi_type: 'functionCategory',
  isOptIn: 'isOptIn',
  uom: 'measurementUnit',
  sdg: 'developmentGoals',
  target_distribution: 'targetDistributionBehavior',
}

export function MasterKpiAdvancedFilters({
  table,
}: MasterKpiAdvancedFiltersProps) {
  const search = useSearch({
    from: '/v2/kpi-library/',
  }) as KpiLibrarySearchParams
  const navigate = useNavigate({ from: '/v2/kpi-library' })

  const currentAdvancedFilters = useMemo(() => {
    if (!search.advancedFilters) return {} as Record<string, string[]>
    try {
      return JSON.parse(search.advancedFilters) as Record<string, string[]>
    } catch {
      return {} as Record<string, string[]>
    }
  }, [search.advancedFilters])

  const activeFiltersCount = Object.keys(currentAdvancedFilters).length

  const handleToggleOption = useCallback(
    (columnId: string, value: string) => {
      const updatedFilters: Record<string, string[]> = {
        ...currentAdvancedFilters,
      }
      const existingValues = new Set(updatedFilters[columnId] || [])

      if (existingValues.has(value)) {
        existingValues.delete(value)
      } else {
        existingValues.add(value)
      }

      const newValues = Array.from(existingValues)
      if (newValues.length > 0) {
        updatedFilters[columnId] = newValues
      } else {
        delete updatedFilters[columnId]
      }

      navigate({
        search: (prev) => ({
          ...prev,
          advancedFilters:
            Object.keys(updatedFilters).length > 0
              ? JSON.stringify(updatedFilters)
              : undefined,
          page: 1,
        }),
      })

      // Also update table column filter for instant UI table sync if needed
      const column = table.getColumn(columnIdMap[columnId] ?? columnId)
      if (column) {
        column.setFilterValue(newValues.length > 0 ? newValues : undefined)
      }
    },
    [currentAdvancedFilters, navigate, table],
  )

  const handleReset = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        advancedFilters: undefined,
        page: 1,
      }),
    })
    table.resetColumnFilters()
  }

  const getSelectedValues = (columnId: string) =>
    new Set<string>(currentAdvancedFilters[columnId] || [])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 gap-2 border-dashed font-medium transition-all hover:bg-primary/5 hover:border-primary/50',
            activeFiltersCount > 0 &&
              'border-primary/50 bg-primary/5 ring-1 ring-primary/20',
          )}
        >
          <Filter className="h-3.5 w-3.5" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <Badge
              variant="soft"
              className="ml-0.5 h-5 min-w-5 rounded-full px-1 flex items-center justify-center text-[10px] bg-primary animate-in zoom-in-50 duration-300"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[360px] p-0 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden border-primary/10"
        align="start"
      >
        <div className="flex-none flex items-center justify-between border-b bg-linear-to-r from-muted/50 to-background px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <Filter className="h-4 w-4 text-primary/80" />
            <h3 className="text-sm font-bold text-foreground">
              Advanced Filters
            </h3>
          </div>
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="soft" className="text-[10px] font-bold">
                {activeFiltersCount} active
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-6 px-1.5 text-[10px] font-bold text-primary/70 hover:text-primary hover:bg-primary/10 transition-colors"
              >
                Reset
              </Button>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1 w-full overflow-y-auto ">
          <div className="p-4 space-y-4">
            <FilterSection
              title="Function Category"
              columnId="kpi_type"
              options={functionCategoryOptions}
              selectedValues={getSelectedValues('kpi_type')}
              onToggle={handleToggleOption}
            />
            <Separator className="opacity-30" />
            <FilterSection
              title="Opt-In Status"
              columnId="isOptIn"
              options={isOptInOptions}
              selectedValues={getSelectedValues('isOptIn')}
              onToggle={handleToggleOption}
            />
            <Separator className="opacity-30" />
            <FilterSection
              title="Measurement Unit"
              columnId="uom"
              options={measurementUnitOptions}
              selectedValues={getSelectedValues('uom')}
              onToggle={handleToggleOption}
            />
            <Separator className="opacity-30" />
            <FilterSection
              title="Sustainable Goals (SDG)"
              columnId="sdg"
              options={sdgOptions}
              selectedValues={getSelectedValues('sdg')}
              onToggle={handleToggleOption}
            />
            <FilterSection
              title="Target Distribution"
              columnId="target_distribution"
              options={targetDistributionOptions}
              selectedValues={getSelectedValues('target_distribution')}
              onToggle={handleToggleOption}
            />
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>

        <div className="flex-none border-t bg-muted/10 px-4 py-2.5">
          <p className="text-[10px] text-center text-muted-foreground/70 leading-relaxed">
            Filters apply instantly. Clear individual selections or use Reset to
            clear all.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
