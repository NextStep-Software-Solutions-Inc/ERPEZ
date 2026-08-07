export type DUAllocation = {
  id: string
  deliveryUnitId: string
  purpose?: string
  amount: number
  isLocked?: boolean
  deliveryUnit?: {
    id: string
    officeName: string
    office: {
      id: string
      name: string
      officeHead: string
    }
  }
}

export type DUAllocationDetails = DUAllocation & {
  purpose: string
  totalAmount: number
  dateAssigned: string
  officeHead: string
  createdAt: string
  deliveryUnit: DeliveryUnit
  receivedFunds: Array<{
    id: string
    fundSourceName: string
    percentageReceived: number
  }>
}
export type DUAllocationStats = {
  totalReceivedAmount: number
  totalAllocatedAmount: number
  totalUtilizedAmount: number
  totalRemainingAmount: number
}
// Delivery Unit within an office
export type DeliveryUnit = {
  id: string
  parentId: string | null
  officeName: string
  kpiCount: number
  subDUCount: number
  totalAmountAllocated: number
  totalAmountUtilized: number
  totalAmountRemaining: number
  fundSourceCount: number
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
  kpiAssignments: Array<any>
  createdAt: string
  createdBy?: string
}

export type AllocationPayload = {
  deliveryUnitId: string
  purpose: string
  amount: number
  duFundAllocations: Array<{
    receivedFundId: string
    amount: number
  }>
}
export type DUFundAllocation = {
  id: string
  duAllocationId: string
  receivedFundId: string
  amount: number
  duAllocation: DUAllocation
  receivedFund: {
    id: string
    description: string
    amount: number
    remainingBalance: number
    receivedDate: string
    utilizedAmount: number
    fundSource: {
      id: string
      name: string
    }
  } 
}