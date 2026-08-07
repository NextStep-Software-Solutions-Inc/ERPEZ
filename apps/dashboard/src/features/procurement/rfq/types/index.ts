/**
 * RFQ Module — Shared Types & Interfaces
 *
 * All domain types for the Request for Quotation module live here.
 * Store-internal mapper helpers are in ../utils/rfqMappers.ts.
 */

// ---------------------------------------------------------------------------
// Store / domain types (previously inline in rfqStore.ts)
// ---------------------------------------------------------------------------

export type RFQItem = {
  id: string
  prId?: string
  itemId?: string
  itemName: string
  quantity: number
  unitOfMeasure?: string
  unitPrice?: number
  totalAmount?: number
  isRequiredBrochure?: boolean
  requiresGreenSpecification?: boolean
  greenSpecification?: string
  // Supplier quotation fields
  bidModel?: string
  bidBrand?: string
  bidColor?: string
  bidUnitPrice?: number
  bidTotalAmount?: number
  bidBrochureUrl?: string
  bidBrochureFileName?: string
  // Metadata for UI filtering
  category?: string
  fund?: string
  month?: string
  monthlyAllocations?: Array<{ month: string; quantity: number }>
}

export type Supplier = {
  id: string
  name: string
  contact?: string
}

export type SupplierOption = {
  id: string
  supplierName: string
  supplierCategory?: string
  contactPerson?: string
}

export type RFQ = {
  id: string
  date: string
  rfqNumber: string
  description?: string
  purpose?: string
  remarks?: string
  tracingNumber?: string
  deadline?: string
  deliveryPeriod?: string
  modeOfProcurement?: string
  suppliers: Array<Supplier>
  items: Array<RFQItem>
  status: 'draft' | 'submitted' | 'returned' | 'approved'
  createdAt: string
  // Optional approval metadata
  signedFileUrl?: string
  approvedAt?: string
  approvedBy?: string
  // Supplier quotation metadata
  quotationStatus?: 'draft' | 'submitted'
  quotationSubmittedAt?: string
  // BAC secretariat review result on the supplier's quotation
  quotationApprovalStatus?: 'Approved' | 'Returned' | 'Pending' | string
  quotationApprovalAt?: string
  quotationApprovalRemarks?: string
}

export type RFQSummary = {
  total: number
  draft: number
  submitted: number
  approved: number
  returned: number
}

// ---------------------------------------------------------------------------
// API / view-model types (previously in ../types.ts)
// ---------------------------------------------------------------------------

/**
 * Supplier requirement detail from GET /suppliers/{id} response
 */
export type SupplierRequirementDetail = {
  supplierRequirementId: string
  requirementName: string
  url: string
  isVerified: boolean
  createdAt: string
  updatedAt: string | null
}

/**
 * Supplier detail from GET /suppliers/{id} response.
 * Used in RFQ details view and supplier dialogs.
 */
export type SupplierDetail = {
  id: string
  name: string
  businessPermitNo: string
  contactPerson: string
  contactNumber: string
  address: string
  email: string
  tinNumber: string
  philGEPSNumber: string
  isBlocked: boolean
  status: string
  statusNote: string | null
  supplierCategoryId: string
  supplierCategory: { id: string; name: string; description: string } | null
  supplierRequirements: SupplierRequirementDetail[]
  createdAt: string
  updatedAt: string | null
}

/**
 * Consolidated PR item from GET /consolidated-prs/for-rfq response
 */
export type ConsolidatedPRItem = {
  id: string
  consolidatedPRId: string
  cprNumber: string
  cprItemId: string
  ItemName: string
  itemName?: string
  category?: string
  prType?: string
  month?: string
  fund?: string
  totalRequired?: number
  currentTotal?: number
  remainingQuantity?: number
  deficit?: number
  unit?: string
  unitOfMeasure?: string
  qty?: number
  unitPrice?: number
  unitCost?: number
  totalAmount?: number
  procurementModeName?: string
  [key: string]: any
}
