import type { KPI } from "../kpi/table/types"

export type KpiTarget = {
    id: string
    kpi: KPI
    targetValue: number
    remainingTargetValue: number
    period: string
    quarterName: string
}