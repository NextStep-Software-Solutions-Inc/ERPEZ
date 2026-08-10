import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { SdgPill } from './SdgPill'
import type { KpiTargetAssignments } from '../../kpi-assignment-for-du'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { SDGS } from '@/components/lib/sdgs'


interface KpiAssignmentCardProps {
  assignment: KpiTargetAssignments
  onViewSubKpis?: (kpiAssignmentId: string) => void
  index?: number
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3 }
  },
}

export function KpiAssignmentCard({
  assignment,
  onViewSubKpis,
  index = 0
}: KpiAssignmentCardProps) {


  const sdgDisplay = (assignment.KPI.SDGs || []).map((sdg, sdgIdx) => {
    const name = typeof sdg === 'string' ? sdg : sdg.name;
    const sdgData = SDGS.find((s) => s.name === name || s.title === name)
    return {
      id: sdgIdx + 1,
      label: name,
      color: sdgData?.color || '#6B7280',
    }
  })
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="show"
      whileHover={{
        scale: 1.01,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        transition: { duration: 0.2 }
      }}
      className="motion-reduce:transition-none motion-reduce:hover:scale-100"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <Card className="border-l-4 border-green-500 shadow-none bg-gray-50 overflow-hidden">
        <CardContent className="p-4">
          {/* Main Grid Layout */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Left Column - KPI Info */}
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground font-normal">
                  KPI
                </Label>
                <div className="text-sm font-semibold mt-1">
                  {assignment.KPI.name}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground font-normal">
                  Function Type
                </Label>
                <div className="text-sm mt-1">
                  {assignment.KPI.functionType}
                </div>
              </div>

              {/* Project/MFOPAPs */}
              {(assignment.KPI.MFOPAPs || []).length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground font-normal">
                    Project
                  </Label>
                  <div className="text-sm mt-1">
                    {(assignment.KPI.MFOPAPs || []).length} Project(s)
                  </div>
                </div>
              )}

              {/* SDGs */}
              {sdgDisplay.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground font-normal">
                    Sustainable Development Goals
                  </Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sdgDisplay.map((sdg) => (
                      <SdgPill
                        key={sdg.id}
                        label={sdg.label}
                        color={sdg.color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Meta Info */}
            <div className="space-y-3 md:text-right">
              {assignment.KPI.kpiTargets && assignment.KPI.kpiTargets.length > 0 && (
                <div className="md:ml-auto md:w-fit">
                  <Label className="text-xs text-muted-foreground font-normal">
                    Target Period
                  </Label>
                  <div className="text-sm mt-1">
                    {assignment.KPI.kpiTargets[0].period}
                    {assignment.KPI.kpiTargets[0].quarterName && ` (${assignment.KPI.kpiTargets[0].quarterName})`}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Row */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
            {/* View Sub-KPIs Link */}
            <Button
              variant={'ghost'}
              onClick={() => onViewSubKpis?.(assignment.id)}
              className={cn(
                'flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700',
                'transition-colors font-medium group',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded',
                assignment.subKPIs.length === 0 && 'opacity-50 cursor-not-allowed'
              )}
              disabled={assignment.subKPIs.length === 0}
              aria-label={`View ${assignment.subKPIs.length} Sub-KPI${assignment.subKPIs.length !== 1 ? 's' : ''}`}
            >
              View {assignment.subKPIs.length} Sub-KPI{assignment.subKPIs.length !== 1 ? 's' : ''}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Button>

            <div className="text-right">
              <span className="text-xs text-muted-foreground">Target Cascaded: </span>
              <span className="text-sm font-bold text-foreground">
                {assignment.allocatedTargetValue}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
