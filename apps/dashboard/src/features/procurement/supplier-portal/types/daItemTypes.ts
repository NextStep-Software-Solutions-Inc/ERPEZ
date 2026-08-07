// ─── DC Item Types ─────────────────────────────────────────────────────────────
// Shared type definitions for the Direct Contracting supplier-portal feature.
// Import from here instead of inlining types in page or component files.

export type DAStatus = 'pending_receipt' | 'for_review' | 'approved' | 'rejected'

export type QuotationItemBid = {
  /** prItemId is optional for the fallback single-item DA quoting flow where
   *  we use 'single' as the key. */
  prItemId?: string
  itemName: string
  qty: number
  unit: string
  bidUnitPrice: number
  bidTotalAmount: number
  bidModel?: string
  bidBrand?: string
  bidColor?: string
  bidBrochureUrl?: string
  bidBrochureFileName?: string
}

export type DirectContractingItem = {
  id: string
  daNumber: string
  prNumber: string
  itemName: string
  supplierOrStore: string
  purchaseSource: 'Local Market' | 'Online' | 'Direct Store' | 'Accredited Supplier'
  quantity: number
  unit: string
  actualPurchaseAmount: number
  totalAmount: number
  receiptAttachment?: string
  receiptFileName?: string
  purchaseDate: string
  status: DAStatus
  remarks?: string
  approvedBy?: string
  approvedAt?: string
  // Quotation fields
  quotationStatus?: 'draft' | 'submitted'
  quotationSubmittedAt?: string
  /** Per-item bids from the linked Consolidated PR */
  quotationItems?: QuotationItemBid[]
  // Legacy single-item bid fields (kept for backward compat)
  bidUnitPrice?: number
  bidTotalAmount?: number
  bidModel?: string
  bidBrand?: string
  bidColor?: string
  bidBrochureUrl?: string
  bidBrochureFileName?: string
  // DA Requirements (Direct Contracting / Sole Distributorship)
  exclusivityProofFileName?: string
  exclusivityProofUrl?: string
  soleDistCertFileName?: string
  soleDistCertUrl?: string
  proposalNotes?: string
  proposalUnitPrice?: number
  proposalAmount?: number
  daRequirementsStatus?: 'draft' | 'submitted'
  daRequirementsSubmittedAt?: string
  // Approval document uploaded by the dashboard when approving an entry
  approvalDocumentFileName?: string
  approvalDocumentUrl?: string
}
