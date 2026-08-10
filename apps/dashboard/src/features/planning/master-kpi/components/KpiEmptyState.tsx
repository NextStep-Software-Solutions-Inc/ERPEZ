import { SearchX, RotateCcw, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface KpiEmptyStateProps {
  isFiltered: boolean
  onReset: () => void
  onCreateClick: () => void
}

export function KpiEmptyState({
  isFiltered,
  onReset,
  onCreateClick,
}: KpiEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center text-center p-8 md:p-12 border-2 border-dashed border-muted-foreground/20 rounded-2xl bg-muted/10 max-w-lg mx-auto my-6"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6 animate-pulse">
        <SearchX className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No KPIs Found
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {isFiltered
          ? "We couldn't find any key performance indicators matching your filters. Try adjusting your search or filters to see more results."
          : "Get started by adding your first key performance indicator to the registry."}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {isFiltered && (
          <Button
            variant="outline"
            size="md"
            onClick={onReset}
            className="h-9 px-4 gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Filters
          </Button>
        )}
        <Button
          variant="default"
          size="md"
          onClick={onCreateClick}
          className="h-9 px-4 gap-2"
        >
          <Plus className="h-4 w-4" />
          Create KPI
        </Button>
      </div>
    </motion.div>
  )
}
