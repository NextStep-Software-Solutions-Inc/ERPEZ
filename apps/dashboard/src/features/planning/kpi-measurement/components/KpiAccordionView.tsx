import { useSetAtom } from 'jotai'
import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { IndicatorItem } from './IndicatorItem'
import {
  editIndicatorDialogOpenAtom,
  deleteIndicatorDialogOpenAtom,
  selectedIndicatorForEditAtom,
  selectedIndicatorForDeleteAtom,
  addIndicatorDialogOpenAtom,
} from '../atoms'
import type { KpiWithIndicators, Indicator } from '../types'

interface KpiAccordionViewProps {
  kpis: KpiWithIndicators[]
  isLoading?: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
}

export function KpiAccordionView({
  kpis,
  isLoading = false,
}: KpiAccordionViewProps) {
  const setEditDialogOpen = useSetAtom(editIndicatorDialogOpenAtom)
  const setDeleteDialogOpen = useSetAtom(deleteIndicatorDialogOpenAtom)
  const setSelectedIndicatorForEdit = useSetAtom(selectedIndicatorForEditAtom)
  const setSelectedIndicatorForDelete = useSetAtom(
    selectedIndicatorForDeleteAtom,
  )
  const setAddDialogOpen = useSetAtom(addIndicatorDialogOpenAtom)

  const handleEditIndicator = (indicator: Indicator) => {
    setSelectedIndicatorForEdit(indicator)
    setEditDialogOpen(true)
  }

  const handleDeleteIndicator = (indicator: Indicator) => {
    setSelectedIndicatorForDelete(indicator)
    setDeleteDialogOpen(true)
  }

  const handleAddIndicator = () => {
    setAddDialogOpen(true)
  }

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading KPIs...</div>
  }

  if (kpis.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="mb-4">No KPIs found</p>
        <Button onClick={handleAddIndicator} size="sm">
          <Plus size={16} className="mr-2" />
          Add Indicator
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      <Accordion
        type="single"
        collapsible
        defaultValue="kpi-001"
        className="w-full"
      >
        {kpis.map((kpi) => (
          <motion.div key={kpi.id} variants={itemVariants}>
            <AccordionItem value={kpi.id} className="border rounded-lg mb-2">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-3 flex-1 text-left">
                  <Badge variant="outline" className="font-mono">
                    {kpi.code}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">{kpi.name}</p>
                    {kpi.description && (
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {kpi.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="ml-2 whitespace-nowrap">
                    {kpi.indicators?.length || 0} indicator
                    {kpi.indicators?.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 py-4 bg-gray-50 space-y-3">
                {kpi.indicators && kpi.indicators.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {kpi.indicators.map((indicator) => (
                        <IndicatorItem
                          key={indicator.id}
                          indicator={indicator}
                          onEdit={handleEditIndicator}
                          onDelete={handleDeleteIndicator}
                          isLoading={isLoading}
                        />
                      ))}
                    </div>
                    <div className="pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAddIndicator}
                        className="w-full"
                      >
                        <Plus size={16} className="mr-2" />
                        Add Another Indicator
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500 mb-3">
                      No indicators defined for this KPI
                    </p>
                    <Button size="sm" onClick={handleAddIndicator}>
                      <Plus size={16} className="mr-2" />
                      Add Indicator
                    </Button>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </motion.div>
  )
}
