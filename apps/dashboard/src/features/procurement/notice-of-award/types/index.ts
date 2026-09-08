export type NoticeOfAwardStatus =
  | 'draft'
  | 'for-approval'
  | 'returned'
  | 'approved'

export type NoticeOfAwardRole = 'procurement-staff' | 'hope'

export type NoticeOfAwardInboxFilter = NoticeOfAwardStatus | 'all'

export type NoticeOfAwardType =
  | 'goods-services'
  | 'infrastructure'
  | 'consulting'

export type ConsolidatedPrStatus = 'approved' | 'linked' | 'for-rfq'

export type ConsolidatedPrLineItem = {
  id: string
  itemName: string
  category: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  amount: number
}

export type ConsolidatedPr = {
  id: string
  prNumber: string
  projectName: string
  projectDescription: string
  endUser: string
  supplierName: string
  modeOfProcurement: 'Public Bidding'
  status: ConsolidatedPrStatus
  taggedForPublicBidding: boolean
  approvedBudget: number
  lineItems: ConsolidatedPrLineItem[]
  createdAt: string
  updatedAt: string
}

export type NoticeOfAwardLineItem = ConsolidatedPrLineItem

export type NoticeOfAwardBacResolutionLink = {
  id: string
  bacResolutionNumber: string
  resolutionDate: string
  description: string
  resolutionType: 'award-recommendation'
  approvedBy?: string | null
  approvedAt?: string | null
  sourceAobNumber?: string | null
  postQualificationDate?: string | null
  sourceModule?: 'bac-resolution' | 'bid-evaluation' | null
  sourceBidEvaluationProjectId?: string | null
  sourceBidEvaluationSupplierId?: string | null
  awardCriterion?: 'LCRB' | 'MEARB' | null
}

export type AwardBacResolutionSource = NoticeOfAwardBacResolutionLink & {
  projectName?: string
  winningSupplierName: string
  awardedAmount: number
  linkedConsolidatedPr: ConsolidatedPr
  lineItems: NoticeOfAwardLineItem[]
}

export type NoticeOfAwardLogEntry = {
  id: string
  action: string
  actor: string
  timestamp: string
  note?: string | null
}

export type NoticeOfAward = {
  id: string
  noaNumber: string
  date: string
  dateBid: string
  description: string
  type: NoticeOfAwardType
  supplierName: string
  status: NoticeOfAwardStatus
  totalAmount: number
  linkedBacResolution: NoticeOfAwardBacResolutionLink
  linkedConsolidatedPr: ConsolidatedPr
  lineItems: NoticeOfAwardLineItem[]
  projectName: string
  projectDescription: string
  createdAt: string
  updatedAt: string
  activityLog: NoticeOfAwardLogEntry[]
  returnReason?: string | null
  approvedBy?: string | null
  approvedAt?: string | null
  issuedAt?: string | null
  contractExecutionDeadline?: string | null
  conformeReceivedDate?: string | null
  performanceSecurityPostedDate?: string | null
  contractExecutionDate?: string | null
  contractExecutionJustification?: string | null
  cascadeTriggeredAt?: string | null
  cascadeTriggeredBy?: string | null
  cascadeNote?: string | null
  signedDocumentFileName?: string | null
  conformeFileName?: string | null
  performanceSecurityFileName?: string | null
  contractFileName?: string | null
  philgepsPostedAt?: string | null
  philgepsReferenceNumber?: string | null
  printFileName?: string | null
}

export type CreateNoticeOfAwardPayload = {
  bacResolutionId: string
  date: string
  dateBid: string
  description: string
  type: NoticeOfAwardType
  noaNumber?: string
}

export type SubmitNoticeOfAwardPayload = {
  noaId: string
}

export type ReturnNoticeOfAwardPayload = {
  noaId: string
  remarks: string
}

export type ApproveNoticeOfAwardPayload = {
  noaId: string
  signedDocument: File
}

export type NoticeOfAwardMilestone =
  | 'conforme_received_date'
  | 'performance_security_posted_date'
  | 'contract_execution_date'

export type LogNoticeOfAwardMilestonePayload = {
  noaId: string
  milestone: NoticeOfAwardMilestone
  date: string
  file: File
}

export type RecordNoticeOfAwardExecutionJustificationPayload = {
  noaId: string
  justification: string
}

export type TriggerNoticeOfAwardCascadePayload = {
  noaId: string
  note?: string | null
}

export type PrintNoticeOfAwardResult = {
  fileName: string
  blob: Blob
}
