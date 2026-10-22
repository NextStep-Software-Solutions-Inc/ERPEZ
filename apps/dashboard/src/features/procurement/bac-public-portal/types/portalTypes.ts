export type ModeOfProcurement = 'public-bidding' | 'svp'

export type ProjectStatus = 'open' | 'closing-soon' | 'closed'

export interface RequiredDocument {
  id: string
  name: string
  description: string
  downloadUrl?: string
  /** Registry key in documentRegistry — when present, clicking Download opens the print dialog */
  viewerDocId?: string
  isTemplate?: boolean
  hasTemplate?: boolean
  postedOn?: string
  envelopeType?: number
}

export interface PublicProjectItem {
  id: string
  itemName: string
  description?: string
  quantity: number
  uom?: string
  abcUnitPrice: number
  abcTotalPrice: number
}

export interface PublicProject {
  id: string
  referenceNo: string
  title: string
  mop: ModeOfProcurement
  status: ProjectStatus
  postedOn: string
  deadline: string
  approvedBudget: number
  nonRefundableFee?: number
  deliveryPeriod: string
  preBidConference?: string
  bidOpening?: string
  scope: string
  requiredDocuments: RequiredDocument[]
  items?: PublicProjectItem[]
  pricingStructure?: 'Itemized' | 'LumpSum' | 'Consulting'
  procurementCategory?: string
}

export interface ApplicationFormData {
  supplierName: string
  email: string
  contactNumber: string
  address: string
  tinNumber: string
  uploadedFiles: { documentId: string; file: File }[]
}

export interface SubmissionResult {
  referenceNumber: string
  submittedAt: string
  projectTitle: string
  totalBidAmount?: number
}

// ─── Backend DTOs & API Payloads ──────────────────────────────────────────────

export interface BackendProjectItem {
  id: string
  itemName?: string
  description?: string
  quantity: number
  uom?: string
  abcUnitPrice?: number
  abcTotalPrice?: number
}

export interface BackendRequiredSubmission {
  checklistItemId: string
  documentName: string
  description?: string
  downloadUrl?: string
  envelopeType?: number
}

export interface BackendBidNotice {
  checklistItemId: string
  downloadUrl?: string
  postedOn?: string
  viewerDocId?: string
}

export interface BackendPublicProject {
  id: string
  contractNo?: string
  title?: string
  modeOfProcurement?: string
  status?: string
  datePosted?: string
  postedOn?: string
  submissionDeadline?: string
  deadline?: string
  abc?: number
  approvedBudget?: number
  nonRefundableBidderFee?: number
  deliveryPeriodDays?: number
  deliveryPeriod?: string
  preBidConferenceDate?: string
  preBidConference?: string
  bidOpeningDate?: string
  bidOpening?: string
  scopeOfWork?: string
  scope?: string
  pricingStructure?: 'Itemized' | 'LumpSum' | 'Consulting'
  procurementCategory?: string
  items?: BackendProjectItem[]
  requiredSubmissions?: BackendRequiredSubmission[]
  bidNotices?: BackendBidNotice[]
}

export interface PublicPortalStats {
  total: number
  publicBidding: number
  svp: number
  closingSoon: number
  closed: number
}

export interface BackendStatsResponse {
  activeProjects?: number
  publicBidding?: number
  smallValueProcurement?: number
  closingSoon?: number
  closed?: number
}

export interface SubmitApplicationItemBid {
  rfqItemId: string
  unitPrice: number
  brand?: string | null
  model?: string | null
  brochureFileId?: string | null
}

export interface SubmitApplicationPayload {
  companyName: string
  contactPerson: string
  emailAddress: string
  contactNumber: string
  tinNumber: string
  businessAddress: string
  documents: Array<{ checklistItemId: string; fileId: string }>
  proposedBidAmount?: number
  deliveryPeriod?: string
  paymentTerms?: string
  warrantyTerms?: string
  validityPeriodDays?: number
  remarks?: string
  bidSecurityType?: string
  bidSecurityAmount?: number
  bidSecurityNumber?: string
  bidSecurityValidityDays?: number
  itemBids?: SubmitApplicationItemBid[]
}

export interface ValidateApplicationPayload {
  companyName: string
  contactPerson: string
  emailAddress: string
  contactNumber: string
  tinNumber: string
  businessAddress: string
  checklistItemIds: string[]
  proposedBidAmount?: number
  deliveryPeriod?: string
  paymentTerms?: string
  warrantyTerms?: string
  validityPeriodDays?: number
  remarks?: string
  bidSecurityType?: string
  bidSecurityAmount?: number
  bidSecurityNumber?: string
  bidSecurityValidityDays?: number
  itemBids?: Array<{
    rfqItemId: string
    unitPrice: number
    brand?: string | null
    model?: string | null
  }>
}
