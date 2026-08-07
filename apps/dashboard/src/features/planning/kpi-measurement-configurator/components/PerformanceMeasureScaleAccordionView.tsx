/**
 * Performance Measure Scale Accordion View Component
 * Displays scales in a clean table with expandable rating scale details
 */
import React, { useState } from 'react'
import { useSetAtom } from 'jotai'
import { IndicatorDimension } from '../types'
import type { PerformanceMeasuringScale } from '../types/performance-measuring-scale.types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Edit2,
  Trash2,
  ChevronRight,
  BarChart3,
  Tag,
  FileText,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { contentLoadAnimations } from '@/utils/animation'
import { cn } from '@/lib/utils'
import { useKpis } from '@/features/planning/master-kpi/handlers/hooks'
import { useRatingScaleTemplates } from '@/features/planning/rating-scale-template/handlers/hooks'
import { TemplatePreview } from '@/features/planning/rating-scale-template/components/TemplatePreview'
import {
  editMeasurementDialogOpenAtom,
  selectedMeasurementForEditAtom,
  deleteMeasurementDialogOpenAtom,
  selectedMeasurementForDeleteAtom,
} from '../atoms'

interface PerformanceMeasureScaleAccordionViewProps {
  scales: PerformanceMeasuringScale[]
  isLoading: boolean
  prefersReducedMotion: boolean
}

const DIMENSION_CONFIG: Record<
  IndicatorDimension,
  { color: 'info' | 'warning' | 'success' }
> = {
  [IndicatorDimension.EFFICIENCY]: { color: 'info' },
  [IndicatorDimension.QUALITY]: { color: 'warning' },
  [IndicatorDimension.TIMELINESS]: { color: 'success' },
}

export function PerformanceMeasureScaleAccordionView({
  scales = [],
  isLoading,
  prefersReducedMotion,
}: PerformanceMeasureScaleAccordionViewProps) {
  const [expandedScale, setExpandedScale] = useState<string | null>(null)
  const setEditDialogOpen = useSetAtom(editMeasurementDialogOpenAtom)
  const setSelectedScaleForEdit = useSetAtom(selectedMeasurementForEditAtom)
  const setDeleteDialogOpen = useSetAtom(deleteMeasurementDialogOpenAtom)
  const setSelectedScaleForDelete = useSetAtom(selectedMeasurementForDeleteAtom)

  const { data: kpisData } = useKpis({
    pathParams: {},
    queryParams: { pageSize: 1000 },
  })
  const { data: templatesData } = useRatingScaleTemplates({
    pathParams: {},
    queryParams: {},
  })

  const masterKpis = kpisData?.data || []
  const templates = templatesData?.data || []

  const handleEdit = (scale: PerformanceMeasuringScale) => {
    setSelectedScaleForEdit(scale)
    setEditDialogOpen(true)
  }

  const handleDeleteClick = (scale: PerformanceMeasuringScale) => {
    setSelectedScaleForDelete(scale)
    setDeleteDialogOpen(true)
  }

  const safeScales = Array.isArray(scales) ? scales : []

  return (
    <motion.div
      className="rounded-xl border overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="bg-muted/50 font-semibold w-8" />
              <TableHead className="bg-muted/50 font-semibold">
                Performance Measure Scale
              </TableHead>
              <TableHead className="bg-muted/50 font-semibold">
                KPI Reference
              </TableHead>
              <TableHead className="bg-muted/50 font-semibold">
                Dimensions
              </TableHead>
              <TableHead className="bg-muted/50 font-semibold">
                Rating Scale
              </TableHead>
              <TableHead className="bg-muted/50 font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeScales.map((scale) => {
              const kpi = masterKpis.find((k) => k.id === scale.masterKPIId)
              const template = scale.templateId
                ? templates.find((t) => t.id === scale.templateId)
                : null
              const isExpanded = expandedScale === scale.id

              return (
                <React.Fragment key={scale.id}>
                  {/* Main Row */}
                  <tr
                    className={cn(
                      'border-b transition-colors cursor-pointer',
                      isExpanded ? 'bg-muted/30' : 'hover:bg-muted/20',
                    )}
                    onClick={() =>
                      setExpandedScale(isExpanded ? null : scale.id)
                    }
                  >
                    {/* Expand toggle */}
                    <TableCell className="pr-0 pl-3 w-8">
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 text-muted-foreground transition-transform duration-200',
                          isExpanded && 'rotate-90',
                        )}
                      />
                    </TableCell>

                    {/* Scale Name */}
                    <TableCell className="min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-primary opacity-70" />
                        <span className="text-sm font-semibold">
                          {scale.name}
                        </span>
                      </div>
                    </TableCell>

                    {/* KPI Reference */}
                    <TableCell className="min-w-[180px]">
                      <div className="space-y-1">
                        {kpi && (
                          <div className="space-y-1">
                            <Badge
                              variant="outline"
                              className="text-[10px] font-mono h-4 px-1"
                            >
                              {kpi.code}
                            </Badge>
                            <p className="text-[11px] text-muted-foreground italic truncate max-w-[150px]">
                              {kpi.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Dimensions */}
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {(scale.dimensions || []).map((dim) => {
                          const config = DIMENSION_CONFIG[dim]
                          return (
                            <Badge
                              key={dim}
                              color={config?.color ?? 'default'}
                              variant="soft"
                              className="text-xs"
                            >
                              {dim}
                            </Badge>
                          )
                        })}
                      </div>
                    </TableCell>

                    {/* Rating Scale */}
                    <TableCell>
                      {template ? (
                        <Badge color="info" variant="soft" className="text-xs">
                          {template.name}
                        </Badge>
                      ) : scale.customRating ? (
                        <Badge
                          color="warning"
                          variant="soft"
                          className="text-xs"
                        >
                          Custom (5-level)
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Not configured
                        </span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(scale)
                          }}
                          title="Edit scale"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(scale)
                          }}
                          title="Delete scale"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </tr>

                  {/* Expandable Content (Rating Scale Details) */}
                  {isExpanded && (
                    <tr className="bg-muted/10 border-b">
                      <TableCell colSpan={6} className="p-0">
                        <div className="px-12 py-8 bg-linear-to-b from-muted/20 to-transparent">
                          <div className="max-w-4xl space-y-8">
                            {/* 1. Scale Name & Statement */}
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                <Tag className="h-4 w-4" />
                                Performance Measure Scale
                              </div>
                              <div className="grid grid-cols-1 gap-4 bg-background border rounded-xl p-5 shadow-sm">
                                <div className="space-y-1">
                                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                    Scale Name
                                  </span>
                                  <p className="text-sm font-semibold">
                                    {scale.name}
                                  </p>
                                </div>
                                {scale.statement && (
                                  <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                      Description / Statement
                                    </span>
                                    <p className="text-xs text-foreground/80 leading-relaxed italic border-l-2 border-primary/20 pl-3">
                                      "{scale.statement}"
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 2. Means of Verification (Badges) */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                <FileText className="h-4 w-4" />
                                Means of Verification
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {(scale.mov || []).map((m, i) => (
                                  <Badge
                                    key={i}
                                    variant="soft"
                                    color="info"
                                    className="font-medium text-[11px] py-1 px-3 border border-info/20 shadow-sm"
                                  >
                                    {m}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* 3. Rating Scale Structure */}
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                <BarChart3 className="h-4 w-4" />
                                Rating Scale Structure
                              </div>

                              <div className="rounded-xl border bg-background shadow-sm overflow-hidden p-6">
                                {template ? (
                                  <TemplatePreview template={template} />
                                ) : scale.customRating ? (
                                  <div className="p-8 text-center bg-muted/20 italic text-muted-foreground text-sm">
                                    Custom 5-level rating scale structure
                                  </div>
                                ) : (
                                  <div className="p-8 text-center bg-muted/20 italic text-muted-foreground text-sm">
                                    No rating scale configured for this
                                    scale
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {safeScales.length === 0 && !isLoading && (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <BarChart3 className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            No performance measure scales found matching your filters.
          </p>
        </div>
      )}
    </motion.div>
  )
}
