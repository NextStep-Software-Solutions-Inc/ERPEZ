/**
 * Performance Measure Scale Card View Component
 * Displays scales in a responsive grid layout with focus on key information
 */

import { useSetAtom } from 'jotai'
import { IndicatorDimension } from '../types'
import type { PerformanceMeasuringScale } from '../types/performance-measuring-scale.types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Edit2, Trash2, FileText, BookOpen, BarChart3, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { contentLoadAnimations } from '@/utils/animation'
import { cn } from '@/lib/utils'
import { useKpis } from '@/features/planning/master-kpi/handlers/hooks'
import { useRatingScaleTemplates } from '@/features/planning/rating-scale-template/handlers/hooks'
import {
  editMeasurementDialogOpenAtom,
  deleteMeasurementDialogOpenAtom,
  selectedMeasurementForEditAtom,
  selectedMeasurementForDeleteAtom,
} from '../atoms'

interface PerformanceMeasureScaleCardViewProps {
  scales: PerformanceMeasuringScale[]
  isLoading: boolean
  prefersReducedMotion: boolean
}

const DIMENSION_CONFIG: Record<
  IndicatorDimension,
  { color: 'info' | 'warning' | 'success'; label: string }
> = {
  [IndicatorDimension.EFFICIENCY]: { color: 'info', label: 'Efficiency' },
  [IndicatorDimension.QUALITY]: { color: 'warning', label: 'Quality' },
  [IndicatorDimension.TIMELINESS]: { color: 'success', label: 'Timeliness' },
}

export function PerformanceMeasureScaleCardView({
  scales = [],
  isLoading,
  prefersReducedMotion,
}: PerformanceMeasureScaleCardViewProps) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
      <AnimatePresence initial={false}>
        {safeScales.map((scale) => {
          const kpi = masterKpis.find((k) => k.id === scale.masterKPIId)
          const template = scale.templateId
            ? templates.find((t) => t.id === scale.templateId)
            : null

          return (
            <motion.div
              key={scale.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className={cn(
                  'group relative flex flex-col rounded-xl border bg-card text-card-foreground',
                  'shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30',
                  'overflow-hidden h-full',
                )}
              >
                {/* Dimension color accent strip */}
                <div className="flex h-1 w-full shrink-0">
                  {(scale.dimensions || []).map((dim) => (
                    <div
                      key={dim}
                      className={cn(
                        'flex-1',
                        dim === IndicatorDimension.EFFICIENCY && 'bg-blue-400',
                        dim === IndicatorDimension.QUALITY && 'bg-amber-400',
                        dim === IndicatorDimension.TIMELINESS &&
                          'bg-emerald-400',
                      )}
                    />
                  ))}
                </div>

                {/* Header: Name + KPI Info */}
                <div className="px-5 pt-4 pb-3 space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Scale Name
                      </span>
                    </div>
                    <p className="text-sm font-semibold leading-snug line-clamp-2">
                      {scale.name || 'Unnamed Scale'}
                    </p>
                  </div>

                  {kpi && (
                    <div className="pt-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono h-4 px-1 opacity-70"
                        >
                          {kpi.code}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground truncate italic">
                          {kpi.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="mx-5" />

                {/* Body: Dimensions + Rating + MOVs */}
                <div className="px-5 py-4 space-y-4 flex-1">
                  {/* Dimensions */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <BookOpen className="h-3 w-3" />
                      <span>Dimensions</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pl-4.5">
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
                  </div>

                  {/* Rating Scale */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <BarChart3 className="h-3 w-3" />
                      <span>Rating Scale</span>
                    </div>
                    <div className="pl-4.5">
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
                    </div>
                  </div>

                  {/* MOV */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span>MOVs</span>
                    </div>
                    <div className="text-xs text-foreground/80 pl-4.5 space-y-0.5">
                      {(scale.mov || []).slice(0, 2).map((mov, i) => (
                        <p key={i}>• {mov}</p>
                      ))}
                      {(scale.mov || []).length > 2 && (
                        <p className="text-muted-foreground">
                          +{(scale.mov || []).length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer: Actions */}
                <div className="px-5 py-3 border-t bg-muted/20 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-muted-foreground italic">
                    Updated {new Date(scale.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(scale)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                      title="Edit scale"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(scale)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                      title="Delete scale"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
