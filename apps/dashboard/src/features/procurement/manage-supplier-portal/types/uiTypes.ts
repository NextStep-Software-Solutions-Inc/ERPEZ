/**
 * UI-specific types for Manage Supplier Portal
 * These types represent local component state and UI logic
 */

export interface Project {
  id: string
  title: string
  status: string
  type: string
  source: 'rfq' | 'bac'
  sourceNumber?: string
  datePosted: string
  deadline: string
  abc: number
  applicantCount: number
}

export interface SupplierBid {
  id: string
  projectId: string
  source: 'rfq' | 'bac'
  supplierName: string
  supplierCategory?: string
  contactPerson?: string
  contactNumber?: string
  email?: string
  registrationNumber?: string
  tinNumber?: string
  philGepsStatus?: 'Active' | 'Inactive' | 'Pending' | string
  certifications?: string[]
  businessAddress?: string
  totalBidAmount: number
  deliveryPeriod?: string
  paymentTerms?: string
  warrantyTerms?: string
  validityPeriodDays?: number
  remarks?: string
  evaluatedBy?: string
  evaluatedAt?: string
  status: 'Pending' | 'Passed' | 'Failed' | string
  submittedAt: string
  documents: {
    id: string
    name: string
    url: string
    type: 'PDF' | 'Image' | 'Other' | string
    envelopeType?: number
    checklistItemId?: string
  }[]
  items?: {
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
  }[]
}

export interface EvaluationState {
  status: 'Pending' | 'Passed' | 'Failed' | string
  remarks: string
  isDirty: boolean
}
