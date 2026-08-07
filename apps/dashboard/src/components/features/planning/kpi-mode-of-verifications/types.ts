import type { KPI } from "../kpi/types"

export type KPIModeOfVerification = {
    file: File | null
    id: string
    kpiId: string
    name: string
    description?: string
    fileId?: string 
    url?: string | null
    kpi?: KPI
}
