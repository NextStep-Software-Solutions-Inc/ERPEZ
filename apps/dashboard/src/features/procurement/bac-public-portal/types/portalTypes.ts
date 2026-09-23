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
