import { useAtom, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Grid2X2, Table as TableIcon } from 'lucide-react'
import { KpiCard } from '../components/KpiCard'
import { KpiAccordionView } from '../components/KpiAccordionView'
import { KpiTable } from '../table'
import { AddIndicatorDialog } from '../dialogs/AddIndicatorDialog'
import { EditIndicatorDialog } from '../dialogs/EditIndicatorDialog'
import { DeleteIndicatorDialog } from '../dialogs/DeleteIndicatorDialog'
import {
  kpiMeasurementViewModeAtom,
  addIndicatorDialogOpenAtom,
  kpiWithIndicatorsAtom,
} from '../atoms'
import { getKpiWithIndicatorsHandler } from '../handlers'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4 },
  },
}

export function KpiMeasurementPage() {
  const [viewMode, setViewMode] = useAtom(kpiMeasurementViewModeAtom)
  const [kpisWithIndicators, setKpisWithIndicators] = useAtom(
    kpiWithIndicatorsAtom,
  )
  const setAddDialogOpen = useSetAtom(addIndicatorDialogOpenAtom)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredKpis, setFilteredKpis] = useState(kpisWithIndicators)

  // Fetch KPI data
  const { data: kpiData, isLoading } = useQuery({
    queryKey: ['kpi-with-indicators'],
    queryFn: () => getKpiWithIndicatorsHandler(),
    refetchInterval: false,
  })

  // Update context with fetched data
  useEffect(() => {
    if (kpiData?.data) {
      setKpisWithIndicators(kpiData.data)
    }
  }, [kpiData?.data, setKpisWithIndicators])

  // Apply search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredKpis(kpisWithIndicators)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = kpisWithIndicators.filter(
      (kpi) =>
        kpi.code.toLowerCase().includes(query) ||
        kpi.name.toLowerCase().includes(query) ||
        kpi.description?.toLowerCase().includes(query),
    )

    setFilteredKpis(filtered)
  }, [searchQuery, kpisWithIndicators])

  const handleAddIndicator = () => {
    setAddDialogOpen(true)
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              KPI Measurement Configuration
            </h1>
            <p className="text-gray-600 mt-1">
              Define success indicators and attach rating scales to KPIs
            </p>
          </div>
          <Button onClick={handleAddIndicator} size="lg" className="gap-2">
            <Plus size={20} />
            Add Indicator
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 bg-white p-4 rounded-lg border">
          <Input
            placeholder="Search by KPI code, name, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />

          {/* View Toggle */}
          <Tabs
            defaultValue={viewMode}
            onValueChange={(value) => setViewMode(value as 'card' | 'table')}
            className="w-auto"
          >
            <TabsList>
              <TabsTrigger value="card" className="gap-2">
                <Grid2X2 size={16} />
                Cards
              </TabsTrigger>
              <TabsTrigger value="table" className="gap-2">
                <TableIcon size={16} />
                Table
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>

      {/* Content Section */}
      {viewMode === 'card' ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredKpis.length > 0 ? (
            filteredKpis.map((kpi) => (
              <motion.div key={kpi.id} variants={itemVariants}>
                <KpiCard
                  kpi={kpi}
                  isClickable={true}
                  onClick={() => {
                    // Optional: Scroll to accordion view or expand specific KPI
                  }}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              {searchQuery ? 'No KPIs match your search' : 'No KPIs found'}
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <KpiTable data={filteredKpis} isLoading={isLoading} />
        </motion.div>
      )}

      {/* Accordion View (always shown below for detailed access) */}
      {!isLoading && filteredKpis.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold">Detailed View</h2>
          <KpiAccordionView kpis={filteredKpis} isLoading={isLoading} />
        </motion.div>
      )}

      {/* Dialogs */}
      <AddIndicatorDialog />
      <EditIndicatorDialog />
      <DeleteIndicatorDialog />
    </div>
  )
}

export default KpiMeasurementPage
