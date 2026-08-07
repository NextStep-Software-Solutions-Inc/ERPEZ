import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Info } from 'lucide-react'
import { MasterKPI, getDistributionBehaviorColor } from '../types'
import { cn } from '@/lib/utils'
import { SDG } from '@/components/features/planning/SDGs/types'
import { getDevelopmentGoalColor } from '../utils/kpiTagColors.ts'
import { getDistributionBehaviorLabel } from '../utils/kpiDistributionBehavior.ts'

interface KpiDetailsBadgesPopoverProps {
  kpi: MasterKPI
}

export function KpiDetailsBadgesPopover({ kpi }: KpiDetailsBadgesPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="inline-flex items-center justify-center rounded-full p-1 hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
          title="More details"
        >
          <Info className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Distribution Behavior
            </h4>

            <Badge
              variant="outline"
              className={cn(
                'font-medium',
                getDistributionBehaviorColor(
                  kpi.targetDistributionBehavior ?? kpi.distributionBehavior,
                ),
              )}
            >
              {getDistributionBehaviorLabel(
                kpi.targetDistributionBehavior ?? kpi.distributionBehavior,
              )}
            </Badge>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sustainable Development Goals
            </h4>
            {(kpi.SDGs || [])?.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {kpi.SDGs?.map((sdg: SDG) => (
                  <Badge
                    key={sdg.id}
                    variant="outline"
                    className={cn(
                      'text-[10px] py-0 px-1.5',
                      getDevelopmentGoalColor(sdg.name),
                    )}
                  >
                    {sdg.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No SDGs associated with this KPI. Consider linking relevant SDGs
                to align with global development priorities and enhance the
                impact of your KPI.
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
