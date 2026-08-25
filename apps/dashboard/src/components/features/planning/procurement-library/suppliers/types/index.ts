export type SupplierCategoryInfo = {
  id: string
  name: string | null
  description: string | null
  createdAt: string
  updatedAt: string | null
}

export type SupplierRequirementInfo = {
  supplierRequirementId: string
  requirementName: string | null
  url?: string | null
  fileId?: string | null
  isVerified: boolean
  createdAt: string
  updatedAt?: string | null
}

export type SupplierListItem = {
  id: string
  name: string | null
  businessPermitNo: string | null
  contactPerson: string | null
  contactNumber: string | null
  email: string | null
  address: string | null
  tinNumber: string | null
  philGEPSNumber: string | null
  isBlacklisted: boolean
  status: SupplierStatus | null
  supplierCategoryId: string
  supplierCategoryName: string | null
  createdAt: string
  updatedAt: string | null
}

export type SupplierDetail = {
  id: string
  name: string | null
  businessPermitNo: string | null
  contactPerson: string | null
  contactNumber: string | null
  address: string | null
  email: string | null
  tinNumber: string | null
  philGEPSNumber: string | null
  isBlacklisted: boolean
  status: SupplierStatus
  supplierCategoryId: string
  supplierCategory: SupplierCategoryInfo | null
  supplierRequirements: SupplierRequirementInfo[] | null
  createdAt: string
  updatedAt: string | null
}

export type SupplierFormValues = {
  name: string
  businessPermitNo: string
  contactPerson: string
  contactNumber: string
  address: string
  email: string
  tinNumber: string
  philGEPSNumber: string
  supplierCategoryId: string
  status: SupplierStatus
  isBlacklisted: boolean
  requirements: SupplierRequirementFormValue[]
}

export type SupplierRequirement = {
  requirementName: string | null
  fileId: string | null
}

export type SupplierRequirementFormValue = {
  id: string
  requirementName: string
  file: File | null
  fileId: string | null
}

export type SupplierStatus = 'Pending' | 'Approved' | 'Declined'

export type CreateSupplierPayload = {
  name?: string | null
  businessPermitNo?: string | null
  contactPerson?: string | null
  contactNumber?: string | null
  address?: string | null
  email?: string | null
  tinNumber?: string | null
  philGEPSNumber?: string | null
  supplierCategoryId: string
  requirements?: SupplierRequirement[] | null
  supplierRequirements?: SupplierRequirement[] | null
}

export type SupplierRequirementVerificationItem = {
  supplierRequirementId: string
  isVerified: boolean
}

export type VerifySupplierRequirementsPayload = {
  requirements: SupplierRequirementVerificationItem[]
}

export type UpdateSupplierPayload = {
  name?: string | null
  businessPermitNo?: string | null
  contactPerson?: string | null
  contactNumber?: string | null
  address?: string | null
  email?: string | null
  tinNumber?: string | null
  philGEPSNumber?: string | null
  isBlacklisted: boolean
  status?: SupplierStatus | null
  supplierCategoryId: string
}

export type UpdateSupplierStatusPayload =
  | { status: 'Approved' }
  | { status: 'Declined'; statusNote: string }
  | { status: 'Pending' }
  // allow both block and unblock via a boolean to match the UI's Block/Unblock actions
  | { isBlocked: boolean }

export const SUPPLIER_STATUS_OPTIONS: {
  value: SupplierStatus
  label: string
}[] = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Declined', label: 'Declined' },
]
