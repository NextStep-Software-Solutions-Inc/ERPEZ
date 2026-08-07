/**
 * Master KPI Card Component
 * Displays KPI information in a card format with actions
 */

import { motion } from 'framer-motion'
import {
  KpiValueBadge,
  getActivityBadge,
  getFunctionCategoryBadge,
  getGadBadge,
  getHierarchyBadge,
  getMeasurementUnitBadge,
  getMonitoringFrequencyBadge,
  getOptInBadge,
} from '../utils/kpiBadgeUtils'
import { MasterKpiCardActions } from './MasterKpiCardActions'
import { KpiDetailsBadgesPopover } from './KpiDetailsBadgesPopover'
import type { MasterKPI } from '../types'
import { interactionAnimations, useReducedMotion } from '@/utils/animation'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { FileText } from 'lucide-react'

interface IProps {
  kpi: MasterKPI
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  indentLevel?: number
  parentKpiCode?: string
}

export function MasterKpiCard({
  kpi,
  onView,
  onEdit,
  onDelete,
  indentLevel = 0,
  parentKpiCode,
}: IProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      variants={
        prefersReducedMotion ? undefined : interactionAnimations.cardLift
      }
      initial="rest"
      whileHover="hover"
      layout
    >
      <Card
        className={cn(
          'h-full flex flex-col transition-all relative overflow-hidden group border-l-4 rounded-xl',
          indentLevel > 0 ? 'border-l-primary/40' : 'border-l-primary',
        )}
        style={{
          marginLeft: indentLevel > 0 ? `${indentLevel * 12}px` : undefined,
        }}
      >
        <CardHeader className="pb-3 space-y-1 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <CardDescription
                  className="text-base font-bold text-foreground line-clamp-2 leading-snug"
                  title={kpi.name}
                >
                  {kpi.name}
                </CardDescription>
                <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase font-mono py-0 px-1.5 text-muted-foreground border-muted-foreground/30 bg-muted/30"
                  >
                    {kpi.code}
                  </Badge>
                  <KpiValueBadge {...getOptInBadge(kpi.isOptIn)} />
                </div>
              </div>
            </div>

            <div className="shrink-0">
              {(onView || onEdit || onDelete) && (
                <MasterKpiCardActions
                  onView={onView || (() => {})}
                  onEdit={onEdit || (() => {})}
                  onDelete={onDelete || (() => {})}
                />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-hidden">
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">
              {kpi.operationalDefinition}
            </p>
          </div>

          <div className="mt-auto space-y-3">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t">
              <KpiValueBadge
                {...getFunctionCategoryBadge(kpi.functionCategory)}
              />
              <KpiValueBadge
                {...getMonitoringFrequencyBadge(kpi.monitoringFrequency)}
              />
              <KpiValueBadge
                {...getMeasurementUnitBadge(kpi.measurementUnit)}
              />
              <KpiValueBadge {...getGadBadge(kpi.isGAD)} />
            </div>
            {/* Hierarchy Info */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-medium text-muted-foreground/80">
              <div className="flex flex-wrap items-center gap-1.5">
                <KpiValueBadge
                  {...getHierarchyBadge(kpi.parentKPIId, parentKpiCode)}
                />
                <KpiValueBadge {...getActivityBadge(kpi.isActive)} />
              </div>
            </div>
            <div className="ml-auto">
              <KpiDetailsBadgesPopover kpi={kpi} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
