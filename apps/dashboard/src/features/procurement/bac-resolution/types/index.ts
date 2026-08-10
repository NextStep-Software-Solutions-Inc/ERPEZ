export type BacResolutionStatus =
  | 'draft'
  | 'for-approval'
  | 'returned'
  | 'approved'

export type BacResolutionRole = 'procurement-staff' | 'bac-chairperson'

export type BacResolutionWorkspaceScope = 'all' | 'public-bidding'

export type BacResolutionListRoutePath =
  | '/v2/bac-resolutions'
  | '/v2/bac-resolutions-public-bidding'

export type BacResolutionScheduleRoutePath =
  | '/v2/bac-resolutions/$resolutionId/bidding-schedule'
  | '/v2/bac-resolutions-public-bidding/$resolutionId/bidding-schedule'

export type BacResolutionInboxFilter = BacResolutionStatus | 'all'

export type BacResolutionType =
  | 'award-recommendation'
  | 'procurement-mode-recommendation'

export type BacResolutionAwardRecommendation = {
  winningSupplierName: string
  awardedAmount: number
  sourceAobNumber?: string | null
  postQualificationDate?: string | null
}

export type BacResolutionClause = {
  id?: string | null
  name: string
  body: string
}

export type BacResolutionProvisionalMemberRole = 'End-user Rep' | 'Tech Rep'

export type BacResolutionProvisionalMember = {
  id: string
  role: BacResolutionProvisionalMemberRole
  name: string
  position: string
  userId?: string | null
}

export type BacResolutionSignatoryOverride = {
  chairperson?: string
  viceChairperson?: string
}

export type ConsolidatedPrStatus = 'approved' | 'linked' | 'for-rfq'

export type ConsolidatedPrLink = {
  id: string
  prNumber: string
  description: string
  endUser: string
  projectName: string
  amount: number
  modeOfProcurement: string
  status: ConsolidatedPrStatus
}

export type BacResolutionLogEntry = {
  id: string
  action: string
  actor: string
  timestamp: string
  note?: string | null
}

export type BacResolution = {
  id: string
  bacResolutionNumber: string
  resolutionType?: BacResolutionType | null
  resolutionDate: string
  description: string
  resolvedDateText: string
  resolvedLocationText: string
  whereasClauses: BacResolutionClause[]
  provisionalMembers: BacResolutionProvisionalMember[]
  signatoryOverrides?: BacResolutionSignatoryOverride
  status: BacResolutionStatus
  createdBy: string
  createdAt: string
  updatedAt: string
  totalAmount: number
  awardRecommendation?: BacResolutionAwardRecommendation | null
  linkedConsolidatedPrs: ConsolidatedPrLink[]
  activityLog: BacResolutionLogEntry[]
  returnReason?: string | null
  approvedBy?: string | null
  approvedAt?: string | null
  signedDocumentFileName?: string | null
  printFileName?: string | null
  workspaceOrigin?: 'public-bidding' | 'standard' | null
}

export type BacResolutionListItem = BacResolution

export type CreateBacResolutionPayload = {
  title?: string
  abc?: number
  resolutionType?: string
  bacResolutionNumber: string
  resolutionDate: string
  description: string
  resolvedDateText: string
  resolvedLocationText: string
  whereasClauses: BacResolutionClause[]
  provisionalMembers: BacResolutionProvisionalMember[]
  signatoryOverrides?: BacResolutionSignatoryOverride
  workspaceOrigin?: 'public-bidding' | 'standard' | null
  endUserRepresentativeId?: string | null
  techRepresentativeId?: string | null
}

export type LinkConsolidatedPrsPayload = {
  bacResolutionId: string
  consolidatedPRId: string
}

export type SubmitBacResolutionPayload = {
  bacResolutionId: string
}

export type ReturnBacResolutionPayload = {
  bacResolutionId: string
  reason: string
}

export type ApproveBacResolutionPayload = {
  bacResolutionId: string
  signedDocument: File
}

export type WhereasClauseTemplate = {
  id: string
  name: string
  body: string
  createdAt: string
  updatedAt: string
}

export type WhereasClauseTemplatePayload = {
  name: string
  body: string
}

export type PrintBacResolutionResult = {
  fileName: string
  blob: Blob
}
