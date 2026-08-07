import { motion } from 'framer-motion'
import { useState } from 'react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { MoreHorizontal, Pencil, Plus, Trash, ChevronDown } from 'lucide-react'
import { getPerformanceMeasuresRequest } from '../../performance-measure/handlers/getPerformanceMeasuresRequest'
import EditPerformanceMeasuresDialog from '../dialogs/EditPerformanceMeasuresDialog'
import DeleteKPIPerformanceMeasureDialog from '../../kpi-performance-measure/dialogs/DeleteKPIPerformanceMeasureDialog'
import { getKPIPerformanceMeasuresRequest } from '../../kpi-performance-measure/handlers/getKPIPerformanceMeasuresRequest'
import AddKPIPerformanceMeasureDialog from '../../kpi-performance-measure/dialogs/AddKPIPerformanceMeasureDialog'
import type { PerformanceMeasure } from '../types'
import type { KPIPerformanceMeasure } from '../../kpi-performance-measure/types'
import { useKpiData } from '@/providers/KpiProvider'
import { cardVariants, containerVariants, itemVariants } from '@/utils/animation'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

const accentVariants = {
  hidden: { scaleY: 0 },
  show: { scaleY: 1, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

// Group ratings by performance measure
type GroupedRatings = Record<
  string,
  {
    name: string
    ratings: Array<{ id: string; numericalRating: number; remarks: string }>
    kpiPerformanceMeasureId: string
  }
>

export function PerformanceMeasureCard() {
  const kpi = useKpiData() 
  const usePerformanceMeasures = createQueryHookFromTemplate(getPerformanceMeasuresRequest)
  const useKPIPerformanceMeasures = createQueryHookFromTemplate(getKPIPerformanceMeasuresRequest)
  const { data: performanceMeasures } = usePerformanceMeasures({
    pathParams: {},
    queryParams: {}
  })

  const { data: kpiPerformanceMeasures } = useKPIPerformanceMeasures({
    pathParams: {},
    queryParams: {
      filters: `kpiId==${kpi.id}`,
    },
  })

  const [open, setOpen] = useState(false)
  const [editingMeasureId, setEditingMeasureId] = useState<string>('')
  const [deleteMeasureId, setDeleteMeasureId] = useState<string>('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  // Create a map for quick lookup of performance measure names
  const measureMap = new Map<string, string>(
    performanceMeasures?.data?.map((m: PerformanceMeasure) => [m.id, m.name]) || []
  )

  // Group KPI ratings by performanceMeasureId
  const groupedRatings: GroupedRatings = {}

  const kpiRatings = kpi.KPIRatings || []

  // Create a map of performanceMeasureId -> KPIPerformanceMeasure ID
  const kpiPerfMeasureMap = new Map<string, string>(
    kpiPerformanceMeasures?.data?.map((kpm: KPIPerformanceMeasure) => [kpm.performanceMeasureId, kpm.id]) || []
  )

  kpiRatings.forEach((rating) => {
    const measureId = rating.performanceMeasureId
    if (!groupedRatings[measureId]) {
      // Use fetched name or fallback to ID
      const name = measureMap.get(measureId) || `Performance Measure ${measureId.slice(-4)}`
      groupedRatings[measureId] = {
        name,
        ratings: [],
        kpiPerformanceMeasureId: kpiPerfMeasureMap.get(measureId) || '',
      }
    }
    groupedRatings[measureId].ratings.push({
      id: rating.id,
      numericalRating: rating.numericalRating,
      remarks: rating.remarks,
    })
  })


  return (
    <div className="space-y-2 relative overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="px-6 py-2">
        <motion.div variants={cardVariants} initial="hidden" animate="show">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Performance Measures
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Core details about this KPI
              </p>
            </div>
            <Button
              onClick={() => setAddDialogOpen(true)}
              size="sm"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4" />
              Add Performance Measure
            </Button>
          </div>
        </motion.div>
      </div>
      {Object.entries(groupedRatings).map(
        ([measureId, { name, ratings, kpiPerformanceMeasureId }]) => (
        <motion.div
          key={measureId}
          variants={cardVariants}
          initial="hidden"
          animate="show"

        >
          {/* Left accent bar */}
          <motion.div
            variants={accentVariants}
            initial="hidden"
            animate="show"
            className="absolute left-0 top-0 bottom-0 w-2 bg-linear-to-b from-emerald-400 to-teal-500 origin-top"
          />

          <div className="pl-6 pr-6 py-6">
            {/* Content */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              <motion.div
                variants={itemVariants}
                className="rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20 p-4"
              >
                {/* Header */}
                <div className='mb-4 flex justify-between items-center'>
                  <h2 className="text-lg font-medium text-foreground">
                    {name}
                    </h2>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 hover:bg-muted"
                          aria-label="Performance Measure actions"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-40 p-2 bg-white">
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingMeasureId(measureId)
                              setOpen(true)
                            }}
                          >
                            <Pencil className="h-3 w-3 mr-2" /> Edit
                          </Button>
                          {kpi.KPIRatings.length > 5 && (
                            <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteMeasureId(kpiPerformanceMeasureId)
                              setDeleteOpen(true)
                            }}
                          >
                            <Trash className="h-3 w-3 mr-2" /> Delete
                          </Button>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                </div>

                {/* Measurement Metadata */}
                {(kpi as any).measurements && (kpi as any).measurements.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {(kpi as any).measurements.map((measurement: any, idx: number) => (
                      <div key={idx} className="p-3 bg-white rounded border border-emerald-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-teal-50 text-teal-700">
                              {measurement.dimension || 'Dimension'}
                            </Badge>
                            {measurement.isMOVEditable && (
                              <Badge color="secondary" className="text-xs">
                                MOV Editable
                              </Badge>
                            )}
                            {measurement.isScaleEditable && (
                              <Badge color="secondary" className="text-xs">
                                Scale Editable
                              </Badge>
                            )}
                          </div>
                        </div>
                        {measurement.moVs && measurement.moVs.length > 0 && (
                          <Collapsible>
                            <CollapsibleTrigger className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                              <ChevronDown className="h-3 w-3" />
                              Modes of Verification ({measurement.moVs.length})
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2 space-y-1">
                              {measurement.moVs.map((mov: string, movIdx: number) => (
                                <p key={movIdx} className="text-xs text-foreground pl-4 py-1">
                                  • {mov}
                                </p>
                              ))}
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {ratings.length > 0 ? (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-2"
                  >
                    {ratings
                      .sort((a, b) => b.numericalRating - a.numericalRating)
                      .map((rating) => (
                        <motion.div
                          key={rating.id}
                          variants={itemVariants}
                          className="rounded-md bg-emerald-100/70 dark:bg-emerald-900/30 px-4 py-3 text-sm text-foreground"
                        >
                          <span className="font-medium">
                            {rating.numericalRating}:
                          </span>{' '}
                          {rating.remarks || 'No description provided'}
                        </motion.div>
                      ))}
                  </motion.div>
                ) : (
                  <p className="text-sm text-muted-foreground">No ratings available</p>
                )}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      ))}
      <EditPerformanceMeasuresDialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen)
          if (!isOpen) {
            setEditingMeasureId('')
          }
        }}
        performanceMeasureId={editingMeasureId}
      />
      <DeleteKPIPerformanceMeasureDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        deleteMeasureId={deleteMeasureId}
      />
      <AddKPIPerformanceMeasureDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
    </div>
  )
}
