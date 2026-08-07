import { useNavigate } from '@tanstack/react-router'
import { Button } from './ui/button'
import type { KpiTargetAssignments } from "./features/planning/kpi-assignment-for-du"
import type { KPI } from "./features/planning/kpi"
import { cn, splitPascalCase } from "@/lib/utils"
import { filterUniqueKpis } from "@/utils/kpi"

interface KPIAssignmentsDisplayProps {
    kpiTargetAssignments: Array<KpiTargetAssignments>
    deliveryUnitId: string
    opcrId: string
}

export default function KPIAssignmentsDisplay({ kpiTargetAssignments, deliveryUnitId, opcrId }: KPIAssignmentsDisplayProps) {
    const navigate = useNavigate()
    // Filter to unique KPI assignments
    const uniqueAssignments = filterUniqueKpis(kpiTargetAssignments)
    // Build groups keyed by functionType
    const groups = uniqueAssignments.reduce((acc, assignment) => {
        const kpis = Array.isArray(assignment.KPI) ? assignment.KPI : assignment.KPI ? [assignment.KPI] : []
        kpis.forEach((kpi: KPI) => {
            const ft = kpi.functionType || 'Unknown'
            if (!acc[ft]) acc[ft] = []
            acc[ft].push({ kpi, assignment })
        })
        return acc
    }, {} as Record<string, Array<{ kpi: KPI; assignment: KpiTargetAssignments }>>)

    return (
        <div className="space-y-6">
            {(Object.entries(groups)).map(([functionType, items]) => (
                <div key={functionType} className={cn("border rounded p-4 shadow-sm hover:shadow-md border-l-3 ", functionType === 'CoreFunction' ? 'border-l-green-500' : functionType === 'StrategicPriority' ? 'border-l-blue-500' : functionType === 'MandatorySupport' ? 'border-l-orange-500' : '')}>
                    <div className="flex items-center justify-between">
                        <h4 className={cn("font-bold text-lg", functionType === 'CoreFunction' ? 'text-green-500' : functionType === 'StrategicPriority' ? 'text-blue-500' : functionType === 'MandatorySupport' ? 'text-orange-500' : '')}>{splitPascalCase(functionType)}</h4>
                        <div className="grid grid-cols-2 items-center gap-6 ">
                            <span className="text-sm px-2 py-2 rounded-md w-20 text-center border text-muted-foreground">{items.length} KPI{items.length !== 1 ? 's' : ''}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    navigate({
                                        to: `/planning/${deliveryUnitId}/opcr/${opcrId}/kpi/${functionType}/`,
                                    })
                                }
                            >View KPI</Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}