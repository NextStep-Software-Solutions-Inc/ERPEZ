import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface KpiMeasurementConfiguratorHeaderProps {
  onAddClick: () => void
}

export function KpiMeasurementConfiguratorHeader({
  onAddClick,
}: KpiMeasurementConfiguratorHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Performance Measure Scale Configurator
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Define names, tag dimensions, assign default MOVs, and link rating
          templates for every Master KPI configuration
        </p>
      </div>
      <Button onClick={onAddClick} className="shrink-0">
        <Plus className="h-4 w-4 mr-2" />
        Define Performance Measure
      </Button>
    </motion.div>
  )
}
