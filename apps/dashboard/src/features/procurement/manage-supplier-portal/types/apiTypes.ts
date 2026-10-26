/**
 * API Response Types for Manage Supplier Portal
 * These types represent data structures returned from backend endpoints
 */

export interface ProcurementProjectResponse {
  id: string
  title: string
  status: string
  type: string
  datePosted: string
  deadline: string
  abc: number
  applicantCount?: number
  consolidatedPR?: {
    id: string
    cprNumber: string
    description: string
    modeOfProcurementId?: string
    modeOfProcurementName?: string
  }
  biddingActivitySchedules?: Array<{
    id: string
    startDate: string
    endDate: string
    status?: string
  }>
}

export interface SupplierApplicationResponse {
  id: string
  projectId: string
  supplierName: string
  supplierCategory?: string
  contactPerson?: string
  contactNumber?: string
  email?: string
  tinNumber?: string
  businessAddress?: string
  evaluationStatus: 'Pending' | 'Passed' | 'Failed' | string
  submittedAt: string
  totalBidAmount: number
  deliveryPeriod?: string
  paymentTerms?: string
  warrantyTerms?: string
  validityPeriodDays?: number
  remarks?: string
  evaluatedBy?: string
  evaluatedAt?: string
  documents: DocumentResponse[]
}

export interface DocumentResponse {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
  url?: string
  envelopeType?: number
  checklistItemId?: string
}

export interface UpdateApplicationEvaluationPayload {
  evaluationStatus: 'Pending' | 'Passed' | 'Failed' | string
  remarks?: string
  evaluatedBy?: string
}

export interface RFQListItemResponse {
  id: string
  rfqNumber: string
  description?: string
  tracingNumber: string
  modeOfProcurementName?: string
  deadline?: string
  deliveryPeriod?: string
  status: string
  totalAmount: number
  applicantCount: number
  itemCount: number
}

export interface RFQDetailResponse {
  id: string
  rfqNumber: string
  tracingNumber: string
  description?: string
  modeOfProcurementId?: string
  modeOfProcurementName?: string
  consolidatedPRId?: string
  consolidatedPRNumber?: string
  date: string
  deadline?: string
  deliveryPeriod?: string
  purpose?: string
  remarks?: string
  status: string
  totalAmount: number
  items: Array<{
    id: string
    cprItemId: string
    itemNameSnapshot: string
    quantity: number
    unitPriceSnapshot: number
    totalPrice: number
    isBrochureRequired: boolean
    greenSpecification?: string
    categorySnapshot?: string
    fundSnapshot?: string
  }>
  suppliers: Array<{
    supplierId: string
    supplierName: string
    invitedAt: string
  }>
}

export interface RFQSupplierBidResponse {
  id: string
  rfqId: string
  supplierId: string
  supplierName: string
  supplierCategory?: string
  contactPerson?: string
  contactNumber?: string
  email?: string
  tinNumber?: string
  registrationNumber?: string
  businessAddress?: string
  philGepsStatus?: string
  submissionType: string
  status: string
  submittedAt?: string
  totalBidAmount: number
  deliveryPeriod?: string
  paymentTerms?: string
  warrantyTerms?: string
  validityPeriodDays?: number
  remarks?: string
  evaluatedBy?: string
  evaluatedAt?: string
  documents: DocumentResponse[]
  items: Array<{
    id: string
    rfqItemId: string
    itemName: string
    quantity: number
    abcUnitPrice: number
    unitPrice: number
    totalPrice: number
    brand?: string
    model?: string
    color?: string
    brochureFileUrl?: string
    isResponsive: boolean
    disqualificationReason?: string
    qualityScore?: number
  }>
}

export interface UpdateRFQBidEvaluationPayload {
  evaluationStatus: string
  remarks?: string
  evaluatedBy?: string
}
