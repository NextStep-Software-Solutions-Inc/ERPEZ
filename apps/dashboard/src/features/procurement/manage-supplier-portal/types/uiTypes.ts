/**
 * UI-specific types for Manage Supplier Portal
 * These types represent local component state and UI logic
 */

export interface Project {
  id: string
  title: string
  status: 'Active' | 'Closed' | 'Evaluation'
  type: 'SVP' | 'Public Bidding'
  datePosted: string
  deadline: string
  abc: number
  applicantCount?: number
}

export interface SupplierBid {
  id: string
  projectId: string
  supplierName: string
  supplierCategory?: string
  contactPerson?: string
  contactNumber?: string
  email?: string
  registrationNumber?: string
  tinNumber?: string
  philGepsStatus?: 'Active' | 'Inactive' | 'Pending'
  certifications?: string[]
  businessAddress?: string
  totalBidAmount: number
  remarks?: string
  evaluatedBy?: string
  evaluatedAt?: string
  status: 'Pending' | 'Passed' | 'Failed'
  submittedAt: string
  documents: {
    id: string
    name: string
    url: string
    type: 'PDF' | 'Image' | 'Other'
  }[]
}

export interface EvaluationState {
  status: 'Pending' | 'Passed' | 'Failed'
  remarks: string
  isDirty: boolean
}
