/**
 * API Response Types for Manage Supplier Portal
 * These types represent data structures returned from backend endpoints
 */

export interface ProcurementProjectResponse {
  id: string
  title: string
  status: 'Active' | 'Evaluation' | 'Closed'
  type: 'SVP' | 'PublicBidding'
  datePosted: string
  deadline: string
  abc: number
  applicantCount?: number
}

export interface SupplierApplicationResponse {
  id: string
  projectId: string
  supplierName: string
  supplierCategory?: string
  contactPerson?: string
  contactNumber?: string
  email?: string
  evaluationStatus: 'Pending' | 'Passed' | 'Failed'
  submittedAt: string
  totalBidAmount: number
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
}

export interface UpdateApplicationEvaluationPayload {
  evaluationStatus: 'Pending' | 'Passed' | 'Failed'
  remarks?: string
  evaluatedBy?: string
}
