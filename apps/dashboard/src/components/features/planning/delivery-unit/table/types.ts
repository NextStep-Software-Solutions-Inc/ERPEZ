import type { KpiAssignment, KpiTargetAssignments } from "../../kpi-assignment-for-du"

// Delivery Unit within an office
export type DeliveryUnit = {
  id: string
  parentId: string | null
  kpiCount: number
  totalAmountRemaining: number
  subDUCount: number
  officeName: string
  office: {
    id: string
    clusterId?: string | null
    officeHead: string
    name: string
    description: string
    address: string
    email: string
    contactNumber: string
    responsibilityCenterCode: string
    createdAt: string
    createdBy: string
    isDeliveryUnit: boolean
  }
  cluster?: {
    id: string
    name: string
    description?: string | null
    createdAt: string
    createdBy: string
  } | null
  subDeliveryUnits?: Array<DeliveryUnit>
  kpiAssignments: Array<KpiAssignment>
  kpiTargetAssignments: Array<KpiTargetAssignments>
  createdAt: string
  createdBy?: string
}
