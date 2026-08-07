import type { DeliveryUnit } from "../delivery-unit"

export interface OPCRActivity {
    id: string
    opcrId: string
    dukpiAssignmentId: string
    name: string
    description?: string
    budget: number
    PAPDepartments: Array<PAPDepartment>
}

export interface PAPDepartment {
    id: string
    opcrActivityId: string
    deliveryUnit: DeliveryUnit
}
export interface OPCRActivitiesResponse {
    data: Array<OPCRActivity>
    meta?: {
        pageNumber: number
        pageSize: number
        total: number
    }
}
