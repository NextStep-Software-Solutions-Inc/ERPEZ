import { Plus, SlidersHorizontal, X, RotateCcw, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReusableFiscalYearSelector } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/components/ReusableFiscalYearSelector'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'

interface SpmsFunctionConfigToolbarProps {
  fiscalYearId: string
  onFiscalYearChange: (id: string) => void
  onWeightFilterChange: (filters: WeightFilters) => void
  onReset: () => void
  filters: WeightFilters
  onCreateClick: () => void
}

export interface WeightFilters {
  minStrategic?: number
  minCore?: number
  minSupport?: number
}

export function SpmsFunctionConfigToolbar({
  fiscalYearId,
  onFiscalYearChange,
  onWeightFilterChange,
  onReset,
  filters,
  onCreateClick,
}: SpmsFunctionConfigToolbarProps) {
  const hasActiveFilters =
    fiscalYearId !== 'all' ||
    filters.minStrategic !== undefined ||
    filters.minCore !== undefined ||
    filters.minSupport !== undefined

  const activeFilterCount = [
    fiscalYearId !== 'all',
    filters.minStrategic !== undefined,
    filters.minCore !== undefined,
    filters.minSupport !== undefined,
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-muted/20 p-4 rounded-xl border border-border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1 items-center">
          <div className="w-full sm:w-64">
            <ReusableFiscalYearSelector
              onFiscalYearChange={(_, id) => onFiscalYearChange(id)}
              placeholder="Filter by Year"
              showAllOption={true}
              allOptionLabel="All Fiscal Years"
              autoSelectFirst={false}
              size="sm"
              value={fiscalYearId}
            />
          </div>

          <div className="pt-6">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 relative"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Weight Thresholds
                  {activeFilterCount > (fiscalYearId !== 'all' ? 1 : 0) && (
                    <Badge
                      variant="secondary"
                      className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]"
                    >
                      {activeFilterCount - (fiscalYearId !== 'all' ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4 space-y-6" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none text-sm flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    Min. Weight %
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Show configs where weights are greater than:
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium">Strategic</label>
                      <span className="text-xs font-mono text-primary">
                        {filters.minStrategic ?? 0}%
                      </span>
                    </div>
                    <Slider
                      value={[filters.minStrategic ?? 0]}
                      max={100}
                      step={5}
                      onValueChange={([val]) =>
                        onWeightFilterChange({
                          ...filters,
                          minStrategic: val === 0 ? undefined : val,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium">
                        Core Function
                      </label>
                      <span className="text-xs font-mono text-primary">
                        {filters.minCore ?? 0}%
                      </span>
                    </div>
                    <Slider
                      value={[filters.minCore ?? 0]}
                      max={100}
                      step={5}
                      onValueChange={([val]) =>
                        onWeightFilterChange({
                          ...filters,
                          minCore: val === 0 ? undefined : val,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium">Support</label>
                      <span className="text-xs font-mono text-primary">
                        {filters.minSupport ?? 0}%
                      </span>
                    </div>
                    <Slider
                      value={[filters.minSupport ?? 0]}
                      max={100}
                      step={5}
                      onValueChange={([val]) =>
                        onWeightFilterChange({
                          ...filters,
                          minSupport: val === 0 ? undefined : val,
                        })
                      }
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-9 px-2 lg:px-3 text-muted-foreground hover:text-primary transition-colors"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </div>

        <Button onClick={onCreateClick} size="sm" className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Create Weights
        </Button>
      </div>

      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 items-center px-1"
          >
            <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider mr-1">
              Active Filters:
            </span>

            {fiscalYearId !== 'all' && (
              <Badge
                variant="secondary"
                className="pl-2 pr-1 py-0.5 h-6 gap-1 border-primary/20 bg-primary/5 text-primary"
              >
                Year ID: {fiscalYearId}
                <button
                  onClick={() => onFiscalYearChange('all')}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {filters.minStrategic !== undefined && (
              <Badge variant="secondary" className="pl-2 pr-1 py-0.5 h-6 gap-1">
                Strategic ≥ {filters.minStrategic}%
                <button
                  onClick={() =>
                    onWeightFilterChange({
                      ...filters,
                      minStrategic: undefined,
                    })
                  }
                  className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {filters.minCore !== undefined && (
              <Badge variant="secondary" className="pl-2 pr-1 py-0.5 h-6 gap-1">
                Core ≥ {filters.minCore}%
                <button
                  onClick={() =>
                    onWeightFilterChange({ ...filters, minCore: undefined })
                  }
                  className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {filters.minSupport !== undefined && (
              <Badge variant="secondary" className="pl-2 pr-1 py-0.5 h-6 gap-1">
                Support ≥ {filters.minSupport}%
                <button
                  onClick={() =>
                    onWeightFilterChange({ ...filters, minSupport: undefined })
                  }
                  className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
