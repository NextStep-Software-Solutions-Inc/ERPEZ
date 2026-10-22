/**
 * Authoritative TypeScript types matching the backend DTOs for Public Bidding Evaluation
 * under RA 12009 (NGPA) / RA 9184.
 */

// ─── Core Response DTOs ────────────────────────────────────────────────────────

export interface ApplicationDocumentDto {
  id: string
  checklistItemId: string
  name: string
  url: string
  type: string
  size?: number
  uploadedAt?: string
  envelopeType: number
}

export interface BiddingSubmissionItemResponse {
  id: string
  biddingSubmissionId: string
  procurementProjectItemId: string
  itemName?: string | null
  description?: string | null
  quantity: number
  uom: string
  unitPrice?: number | null
  totalPrice?: number | null
  brand?: string | null
  model?: string | null
}

export interface BiddingSubmissionResponse {
  id: string
  procurementProjectId: string
  supplierId: string
  supplierName: string
  tinNumber?: string | null
  publicSupplierApplicationId?: string | null
  originalProposedAmount?: number | null
  isFinancialOpened?: boolean
  bidSecurityType: string
  bidSecurityAmount?: number | null
  bidSecurityNumber?: string | null
  bidSecurityValidityDays?: number | null
  submissionType: string
  submittedAt: string
  remarks?: string | null
  openingRecord?: BidOpeningRecordResponse | null
  documents?: Array<ApplicationDocumentDto>
  items?: Array<BiddingSubmissionItemResponse> | null
}

export interface BidOpeningRecordResponse {
  id: string
  biddingSubmissionId: string
  biddingActivityScheduleId: string
  envelope1Result: 'Passed' | 'Failed' | string
  envelope2Opened: boolean
  asReadBidAmount?: number | null
  disqualificationReason?: string | null
  remarks?: string | null
  openedById?: string | null
  openedByName?: string | null
  openedAt: string
}

export interface BiddingPostQualificationResponse {
  id: string
  biddingEvaluatedBidId: string
  postQualificationNoticeSentAt?: string | null
  docsReceivedDate?: string | null
  targetDeadlineDate?: string | null
  passed?: boolean | null
  status: 'PendingDocs' | 'UnderEvaluation' | 'Passed' | 'Disqualified' | string
  findings?: string | null
  verifiedById?: string | null
  verifiedByName?: string | null
  completedAt?: string | null
}

export interface BiddingEvaluatedBidResponse {
  id: string
  biddingEvaluationId: string
  bidOpeningRecordId: string
  supplierId: string
  supplierName: string
  originalProposedAmount: number
  asReadBidAmount?: number | null
  evaluatedBidPrice: number
  technicalScore?: number | null
  normalizedFinancialScore?: number | null
  totalScore?: number | null
  rank: number
  status: 'Ranked' | 'Under_PostQual' | 'Passed_PostQual' | 'Disqualified' | string
  isResponsive: boolean
  nonResponsiveReason?: string | null
  postQualification?: BiddingPostQualificationResponse | null
  documents?: Array<ApplicationDocumentDto>
}

export interface BiddingAwardRecommendationResponse {
  id: string
  procurementProjectId: string
  winningSupplierId: string
  winningSupplierName: string
  biddingPostQualificationId: string
  awardedAmount: number
  awardCriterion: 'LCRB' | 'MEARB' | string
  recommendedAt: string
  recommendedById?: string | null
  recommendedByName?: string | null
  remarks?: string | null
  resolutionNumber?: string | null
}

export interface BiddingEvaluationResponse {
  id: string
  procurementProjectId: string
  projectName: string
  abc: number
  awardCriterion: 'LCRB' | 'MEARB' | string
  technicalWeight?: number | null
  financialWeight?: number | null
  status: 'Draft' | 'Completed' | string
  evaluatedById?: string | null
  evaluatedByName?: string | null
  evaluatedAt?: string | null
  remarks?: string | null
  evaluatedBids: Array<BiddingEvaluatedBidResponse>
  awardRecommendation?: BiddingAwardRecommendationResponse | null
}

// ─── Mutation Request Payloads ────────────────────────────────────────────────

export interface SubmitBiddingPackagePayload {
  supplierId: string
  originalProposedAmount: number
  bidSecurityType: string
  publicSupplierApplicationId?: string | null
  bidSecurityAmount?: number | null
  bidSecurityNumber?: string | null
  bidSecurityValidityDays?: number | null
  submissionType?: string
  remarks?: string | null
}

export interface RecordBidOpeningPayload {
  biddingSubmissionId: string
  envelope1Result: 'Passed' | 'Failed' | string
  envelope2Opened: boolean
  biddingActivityScheduleId?: string | null
  asReadBidAmount?: number | null
  disqualificationReason?: string | null
  remarks?: string | null
}

export interface BidderEvaluationInputPayload {
  bidOpeningRecordId: string
  evaluatedBidPrice: number
  technicalScore?: number | null
  isResponsive: boolean
  nonResponsiveReason?: string | null
}

export interface EvaluateProjectBidsPayload {
  awardCriterion: 'LCRB' | 'MEARB' | string
  technicalWeight?: number | null
  financialWeight?: number | null
  remarks?: string | null
  bidders: Array<BidderEvaluationInputPayload>
}

export interface SendPostQualificationNoticePayload {
  biddingEvaluatedBidId: string
  noticeSentAt?: string | null
  targetDays?: number
}

export interface LogPostQualificationDocsReceivedPayload {
  biddingEvaluatedBidId: string
  docsReceivedAt?: string | null
  bacEvaluationDays?: number
}

export interface RecordPostQualificationResultPayload {
  biddingEvaluatedBidId: string
  passed: boolean
  findings?: string | null
}

export interface CreateBiddingAwardRecommendationPayload {
  biddingPostQualificationId: string
  remarks?: string | null
}
