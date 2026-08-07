import type { Attribute } from '../../attribute/types'

// Office entity
export type Office = {
  id: string
  clusterId: string
  officeHead: string
  name: string
  description?: string
  address: string
  country: string
  email: string
  contactNumber: string
  responsibilityCenterCode?: string
  cluster?: Cluster
  isDeliveryUnit: boolean
}

// Cluster entity
export type Cluster = {
  id: string
  name: string
  description?: string
  offices?: Array<Office>
}

// Delivery Unit within an office
export type DeliveryUnit = {
  id: string
  officeId: string
  parentDUId?: string | null
  name: string
  description?: string
  duHead: string
  address?: string
  email?: string
  contactNumber?: string
  responsibilityCenterCode?: string
  subDeliveryUnits?: Array<SubDeliveryUnit>
  duAllocations?: Array<DuAllocation>
  office?: Office
}

// Sub Delivery Unit
export type SubDeliveryUnit = {
  id: string
  deliveryUnitId: string
  name: string
  description?: string
  subDeliveryUnitHead: string
  address?: string
  email?: string
  contactNumber?: string
  responsibilityCenterCode?: string
  subDUAllocations?: Array<SubDuAllocation>
}

// DU Allocation
export type DuAllocation = {
  id: string
  deliveryUnitId: string
  purpose: string
  amount: number
  subDUAllocations?: Array<SubDuAllocation>
  duFundAllocations?: Array<DuFundAllocation>
}

// Sub DU Allocation
export type SubDuAllocation = {
  id: string
  duAllocationId: string
  subDeliveryUnitId: string
  amount: number
}

// DU Fund Allocation
export type DuFundAllocation = {
  id: string
  duAllocationId: string
  receivedFundId: string
  amount: number
  receivedFund?: ReceivedFund
}

// Received Fund
export type ReceivedFund = {
  id: string
  fundSourceId: string
  amount: number
  duFundAllocations?: Array<DuFundAllocation>
}

// Fund Source
export type FundSource = {
  id: string
  name: string
  code?: string
  type?: string
  isActive: boolean
  receivedFunds?: Array<ReceivedFund>
}

// Optional Attributes for Offices
export type AttributeAssignment = {
  id: string
  officeId: string
  attribute: Attribute
  value?: string
}
