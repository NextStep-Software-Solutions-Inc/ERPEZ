import type { KpiTargetAssignments } from '@/components/features/planning/kpi-assignment-for-du'

/**
 * Filters KPI assignments to display only those with unique KPI IDs
 * @param kpiTargetAssignments - Array of KPI assignments
 * @returns Array of KPI assignments with unique KPI IDs
 */
export function filterUniqueKpis(kpiTargetAssignments: Array<KpiTargetAssignments>): Array<KpiTargetAssignments> {
    return kpiTargetAssignments.filter((kpi: KpiTargetAssignments, index: number, self: Array<KpiTargetAssignments>) =>
        self.findIndex((k) => k.KPI.id === kpi.KPI.id) === index
    )
}
