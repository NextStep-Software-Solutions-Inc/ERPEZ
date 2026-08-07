import { Organization } from '@/lib/fiscal-year-and-policies/types'
import type { Attribute } from '../../../attribute/types'
import { Category } from '../../../procurement-library'

export type Office = {
  id: string
  positionCount: number
  name?: string
  code?: string
  address?: string
  description?: string
  responsibilityCenterCode?: string
  budgetCostCenter?: string
  officeTypeId: string
  organizationId: string
  categoryId: string
  administrativeLevelId: []
  clusterId?: string
  procurementWorkflowId?: string
  parentId?: string
  officeType: OfficeType
  organization: Organization
  category: Category
  administrativeLevel: AdministrativeLevel
  cluster: Cluster
  procurementWorkflow?: ProcurementWorkflow
  parentOffice?: Office
}

export type OfficeType = {
  id: string
  name?: string
  code?: string
  canHaveChildren: boolean
  isActive: boolean
}
// Cluster entity
export type Cluster = {
  id: string
  name: string
  code: string
  offices?: Array<Office>
  address?: string
  maxSubUnits?: number
  isActive: boolean
}
export type ProcurementWorkflow = {
  id: string
  name?: string
  code?: string
  approvalLevel?: number
  isActive: boolean
}

export type AdministrativeLevel = {
  id: string
  name?: string
  code?: string
  canHaveChildren: boolean
  isActive: boolean
}
// Delivery Unit within an office
export type DeliveryUnit = {
  id: string
  officeId: string
  parentDUId?: string | null
  name: string
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
