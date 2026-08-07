import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getModeColor } from '@/lib/fiscal-year-and-policies/utils/getModeColor'
import type { ProcurementConfigFilterState } from '../hooks/useFilterState'
import type { ProcurementMode } from '@/lib/fiscal-year-and-policies/types'
import type { FiscalYear } from '@/lib/fiscal-year-and-policies/types'

interface SidebarFiltersProps {
  filters: ProcurementConfigFilterState
  hasActiveFilters: boolean
  modes: ProcurementMode[]
  fiscalYears: FiscalYear[]
  onToggleMode: (modeId: string) => void
  onSetFiscalYear: (fiscalYearId: string) => void
  onSetAmountMin: (value: number | undefined) => void
  onSetAmountMax: (value: number | undefined) => void
  onClearFilters: () => void
  className?: string
}

function FilterSection({
  title,
  children,
  onClear,
  isActive,
}: {
  title: string
  children: React.ReactNode
  onClear?: () => void
  isActive?: boolean
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        {isActive && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-primary hover:underline"
          >
            Clear
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

export function SidebarFilters({
  filters,
  hasActiveFilters,
  modes,
  fiscalYears,
  onToggleMode,
  onSetFiscalYear,
  onSetAmountMin,
  onSetAmountMax,
  onClearFilters,
  className,
}: SidebarFiltersProps) {
  return (
    <aside
      className={cn(
        'sticky top-6 self-start w-full rounded-lg border border-border bg-card p-4 space-y-5',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Filters</span>
          {hasActiveFilters && (
            <Badge
              variant="outline"
              className="h-5 px-1.5 text-[10px] font-bold border-primary text-primary"
            >
              Active
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-muted-foreground hover:text-destructive"
            onClick={onClearFilters}
          >
            <X className="h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      <div className="border-b border-border" />

      {/* Fiscal Year Filter */}
      <FilterSection
        title="Fiscal Year"
        isActive={!!filters.fiscalYearId}
        onClear={() => onSetFiscalYear('')}
      >
        <Select
          value={filters.fiscalYearId || 'all'}
          onValueChange={(v) => onSetFiscalYear(v === 'all' ? '' : v)}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="All fiscal years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All fiscal years</SelectItem>
            {fiscalYears.map((fy) => (
              <SelectItem key={fy.id} value={fy.id}>
                FY {fy.year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>

      <div className="border-b border-border" />

      {/* Procurement Mode Filter */}
      <FilterSection
        title="Procurement Mode"
        isActive={filters.modeIds.length > 0}
        onClear={() => filters.modeIds.forEach((id) => onToggleMode(id))}
      >
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {modes.map((mode) => {
            const colors = getModeColor(mode.name)
            const checked = filters.modeIds.includes(mode.id)
            return (
              <label
                key={mode.id}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => onToggleMode(mode.id)}
                  className="shrink-0"
                />
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium transition-opacity',
                    colors.badge,
                    !checked && 'opacity-60 group-hover:opacity-90',
                  )}
                >
                  <span
                    className={cn('h-1.5 w-1.5 rounded-full', colors.dot)}
                  />
                  {mode.name}
                </span>
              </label>
            )
          })}
        </div>
        {/* Active mode chips */}
        {filters.modeIds.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {filters.modeIds.map((id) => {
              const mode = modes.find((m) => m.id === id)
              if (!mode) return null
              const colors = getModeColor(mode.name)
              return (
                <span
                  key={id}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                    colors.badge,
                  )}
                >
                  {mode.name}
                  <button
                    type="button"
                    onClick={() => onToggleMode(id)}
                    className="ml-0.5 hover:opacity-70"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              )
            })}
          </div>
        )}
      </FilterSection>

      <div className="border-b border-border" />

      {/* Amount Range Filter */}
      <FilterSection
        title="Amount Range"
        isActive={
          filters.amountMin !== undefined || filters.amountMax !== undefined
        }
        onClear={() => {
          onSetAmountMin(undefined)
          onSetAmountMax(undefined)
        }}
      >
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Min (₱)</Label>
            <Input
              type="number"
              placeholder="0"
              className="h-8 text-sm"
              min={0}
              step={0.01}
              value={filters.amountMin ?? ''}
              onChange={(e) =>
                onSetAmountMin(
                  e.target.value ? parseFloat(e.target.value) : undefined,
                )
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Max (₱)</Label>
            <Input
              type="number"
              placeholder="No limit"
              className="h-8 text-sm"
              min={0}
              step={0.01}
              value={filters.amountMax ?? ''}
              onChange={(e) =>
                onSetAmountMax(
                  e.target.value ? parseFloat(e.target.value) : undefined,
                )
              }
            />
          </div>
        </div>
      </FilterSection>
    </aside>
  )
}
