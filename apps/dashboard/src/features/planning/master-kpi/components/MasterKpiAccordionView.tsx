/**
 * Master KPI Accordion View Component
 * Displays KPIs in a hierarchical accordion format, grouping sub-KPIs under parent KPIs
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Edit, Trash2, ChevronRight } from 'lucide-react'
import { itemAnimations } from '@/utils/animation'
import {
  MonitoringFrequency,
  FunctionCategory,
  MeasurementUnit,
  MasterKPI,
} from '../types'
import { cn } from '@/lib/utils'

export interface MasterKpiAccordionViewProps {
  kpis: MasterKPI[]
  onView: (kpi: MasterKPI) => void
  onEdit: (kpi: MasterKPI) => void
  onDelete: (kpi: MasterKPI) => void
  isLoading?: boolean
}

// Color map for function categories
const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Strategic':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'Core':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'Support':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

export function MasterKpiAccordionView({
  kpis,
  onView,
  onEdit,
  onDelete,
  isLoading = false,
}: MasterKpiAccordionViewProps) {
  // Organize KPIs: parent KPIs with their sub-KPIs
  const organizedKpis = useMemo(() => {
    const parents: Map<string, MasterKPI> = new Map()
    const subs: Map<string, MasterKPI[]> = new Map()

    // Separate parents and sub-KPIs
    kpis.forEach((kpi) => {
      if (!kpi.parentKPIId) {
        parents.set(kpi.id, kpi)
        if (!subs.has(kpi.id)) {
          subs.set(kpi.id, [])
        }
      } else {
        if (!subs.has(kpi.parentKPIId)) {
          subs.set(kpi.parentKPIId, [])
        }
        subs.get(kpi.parentKPIId)!.push(kpi)
      }
    })

    // Also include standalone sub-KPIs whose parents aren't in the list
    const standaloneParents: MasterKPI[] = []
    kpis.forEach((kpi) => {
      if (kpi.parentKPIId && !parents.has(kpi.parentKPIId)) {
        if (!standaloneParents.find((p) => p.id === kpi.parentKPIId)) {
          standaloneParents.push({
            id: kpi.parentKPIId,
            code: '',
            name: 'Parent Indicator (Not Available)',
            operationalDefinition: '',
            monitoringFrequency: MonitoringFrequency.QUARTERLY,
            measurementUnit: MeasurementUnit.NUMBER,
            isGAD: false,
            complianceTags: [],
            functionCategory: FunctionCategory.STRATEGIC, // Default category for unknown parents
            SDGs: [],
            archivedAt: null,
            attributes: [],
            createdAt: '',
            updatedAt: '',
            targetDistributionBehavior: null,
            distributionBehavior: null,
            isOptIn: false,
            isActive: true,
            status: null,
            isArchived: false,
          })
        }
      }
    })

    return {
      parentKpis: Array.from(parents.values()),
      subKpis: subs,
      standaloneParents,
    }
  }, [kpis])

  const allParents = useMemo(() => {
    return [
      ...organizedKpis.parentKpis,
      ...organizedKpis.standaloneParents,
    ].sort((a, b) => a.code.localeCompare(b.code))
  }, [organizedKpis])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="h-20 bg-muted rounded-md animate-pulse"
            variants={itemAnimations.slideUpFade}
            initial="hidden"
            animate="show"
            custom={i}
          />
        ))}
      </div>
    )
  }

  if (kpis.length === 0) {
    return (
      <motion.div
        className="text-center py-12"
        variants={itemAnimations.slideUpFade}
        initial="hidden"
        animate="show"
      >
        <p className="text-muted-foreground">
          No indicators found. Try adjusting your filters.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Accordion type="multiple" className="w-full space-y-2">
        <AnimatePresence>
          {allParents.map((parentKpi, parentIdx) => {
            const subKpiList = organizedKpis.subKpis.get(parentKpi.id) || []
            const isStandalone = parentKpi.code === ''

            return (
              <motion.div
                key={parentKpi.id}
                variants={itemAnimations.slideUpFade}
                initial="hidden"
                animate="show"
                custom={parentIdx}
              >
                <AccordionItem
                  value={parentKpi.id}
                  className={cn(
                    'border rounded-lg px-4 transition-all hover:shadow-md',
                    isStandalone && 'opacity-75',
                  )}
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 flex-1 text-left">
                      <ChevronRight className="h-4 w-4 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded shrink-0">
                            {parentKpi.code || 'N/A'}
                          </code>
                          <span className="font-semibold truncate flex-1">
                            {parentKpi.name}
                          </span>
                          <Badge
                            variant="outline"
                            className={getCategoryColor(
                              parentKpi.functionCategory,
                            )}
                          >
                            {parentKpi.functionCategory}
                          </Badge>
                          {subKpiList.length > 0 && (
                            <Badge variant="outline">
                              {subKpiList.length} sub-indicator
                              {subKpiList.length !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {parentKpi.operationalDefinition}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pt-4 pb-4">
                    <div className="space-y-3">
                      {/* Parent Indicator Actions */}
                      <div className="flex items-center justify-between bg-muted/50 p-3 rounded">
                        <span className="text-sm font-medium">
                          Parent Indicator
                        </span>
                        <div className="flex items-center gap-1">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onView(parentKpi)}
                              title="View"
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(parentKpi)}
                              title="Edit"
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(parentKpi)}
                              title="Delete"
                              className="h-8 w-8 p-0 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>

                      {/* Sub-Indicators List */}
                      {subKpiList.length > 0 ? (
                        <div className="space-y-2 pl-2 border-l-2 border-muted">
                          {subKpiList.map((subKpi, subIdx) => (
                            <motion.div
                              key={subKpi.id}
                              className="flex items-center justify-between bg-background p-3 rounded border hover:shadow-sm transition-shadow"
                              variants={itemAnimations.slideUpFade}
                              custom={subIdx}
                              initial="hidden"
                              animate="show"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded shrink-0">
                                    {subKpi.code}
                                  </code>
                                  <span className="text-sm font-medium truncate flex-1">
                                    {subKpi.name}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {subKpi.operationalDefinition}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0 ml-2">
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onView(subKpi)}
                                    title="View"
                                    className="h-7 w-7 p-0"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                </motion.div>
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEdit(subKpi)}
                                    title="Edit"
                                    className="h-7 w-7 p-0"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                </motion.div>
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDelete(subKpi)}
                                    title="Delete"
                                    className="h-7 w-7 p-0 hover:text-destructive"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </motion.div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No sub-KPIs
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </Accordion>
    </motion.div>
  )
}
