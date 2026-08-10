import { Target } from 'lucide-react'
import type { KPI } from '@/components/features/planning/kpi/types'

interface KpiDetailsSectionProps {
    kpi: KPI
}

export function KpiDetailsSection({ kpi }: KpiDetailsSectionProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kpi.isTargetValueAllocable && (
                <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Target Value Allocable</span>
                </div>
            )}
            {(kpi.kpiTargets || []).length > 0 && (
                <div className="text-sm">
                    <span className="font-medium">Targets:</span> {(kpi.kpiTargets || []).length} defined
                </div>
            )}
            {(kpi.Attributes || []).length > 0 && (
                <div className="text-sm">
                    <span className="font-medium">Attributes:</span> {(kpi.Attributes || []).length}
                </div>
            )}
        </div>
    )
}
