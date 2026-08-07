import { Search, SlidersHorizontal, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import DebouncedInput from '@/components/DebouncedInput'
import { IndicatorDimension } from '../types'

interface MasterKPI {
  id: string
  code: string
  name: string
}

interface KpiMeasurementConfiguratorFiltersProps {
  kpiParam?: string
  searchFilter: string
  dimensionFilter?: string
  masterKpis: MasterKPI[]
  isLoadingKpis: boolean
  isFiltered: boolean
  onKpiChange: (kpiId: string) => void
  onDimensionChange: (dimension: string) => void
  onSearchChange: (value: string) => void
  onClearFilters: () => void
}

export function KpiMeasurementConfiguratorFilters({
  kpiParam,
  searchFilter,
  dimensionFilter,
  masterKpis,
  isLoadingKpis,
  isFiltered,
  onKpiChange,
  onDimensionChange,
  onSearchChange,
  onClearFilters,
}: KpiMeasurementConfiguratorFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-4 rounded-xl border bg-muted/30"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground shrink-0">
        <SlidersHorizontal className="h-4 w-4" />
        <span>Filters</span>
      </div>

      <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
        {/* Master KPI Filter */}
        <Select value={kpiParam || 'all'} onValueChange={onKpiChange}>
          <SelectTrigger className="w-full sm:w-72 lg:w-80 bg-background overflow-hidden [&>span]:line-clamp-1 [&>span]:truncate [&>span]:text-left">
            <SelectValue placeholder="All Master KPIs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {isLoadingKpis ? 'Loading KPIs...' : 'All Master KPIs'}
            </SelectItem>
            {masterKpis.map((kpi) => (
              <SelectItem key={kpi.id} value={kpi.id}>
                {kpi.code} — {kpi.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Dimension Filter */}
        <Select value={dimensionFilter || 'all'} onValueChange={onDimensionChange}>
          <SelectTrigger className="w-full sm:w-40 lg:w-48 bg-background overflow-hidden [&>span]:line-clamp-1 [&>span]:truncate [&>span]:text-left">
            <SelectValue placeholder="All Dimensions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dimensions</SelectItem>
            {Object.values(IndicatorDimension).map((dim) => (
              <SelectItem key={dim} value={dim}>
                {dim}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <DebouncedInput
            placeholder="Search by KPI, MOV, or dimension..."
            value={searchFilter}
            onChange={onSearchChange}
            debounceMs={300}
            className="pl-9 bg-background"
          />
          {searchFilter && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Clear Filters */}
        <AnimatePresence>
          {isFiltered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="shrink-0 text-muted-foreground"
              >
                <X className="h-3.5 w-3.5 mr-1.5" />
                Clear all
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
