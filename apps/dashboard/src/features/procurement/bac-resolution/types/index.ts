import { APPItem } from "@/features/planning/annual-performance-planning/types/appItem.type"
import { ConsolidatedPR } from "../../consolidated-pr/store/consolidatedPRStore"

export type BacResolutionStatus =
  'draft' | 'for-approval' | 'returned' | 'approved'

export type BacResolutionRole = 'procurement-staff' | 'bac-chairperson' | 'all'

export type BacResolutionWorkspaceScope = 'all' | 'public-bidding'

export type BacResolutionListRoutePath =
  '/v2/bac-resolutions' | '/v2/bac-resolutions-public-bidding'

export type BacResolutionScheduleRoutePath =
  | '/v2/bac-resolutions/$resolutionId/bidding-schedule'
  | '/v2/bac-resolutions-public-bidding/$resolutionId/bidding-schedule'

export type BacResolutionInboxFilter = BacResolutionStatus | 'all'

export type BacResolutionType =
  'award-recommendation' | 'procurement-mode-recommendation'

export type BacResolutionAwardRecommendation = {
  winningSupplierName: string
  awardedAmount: number
  sourceAobNumber?: string | null
  postQualificationDate?: string | null
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

export type ProcurementSourceType = 'AppItem' | 'ConsolidatedPr'

export type AppRecord = {
  id: string
  appNumber: string
  title: string
  fiscalYear: string
  implementingUnit: string
  totalBudget: number
  itemCount: number
  status: 'approved' | 'draft'
}

export type AppItemLink = {
  id: string
  appNumber: string
  itemNumber: string
  description: string
  officeName: string
  modeOfProcurement: string
  sourceOfFund: string
  abc: number
  status: 'eligible' | 'linked'
}

export type EligibleAppItem = {
  id: string
  itemNumber: string
  description: string
  ppmpItemName?: string
  remarks?: string
  officeName: string
  procurementModeId: string | null
  procurementModeName: string
  fundSourceId: string | null
  fundSourceName: string
  effectiveABC: number
}

export type EligibleAppForProcurement = {
  id: string
  appNumber: string
  name: string
  fiscalYearName: string
  eligibleItems: EligibleAppItem[]
}

export type EligibleConsolidatedPR = {
  id: string
  prNumber: string
  description: string
  endUser: string
  projectName: string
  totalAmount: number
  modeOfProcurementName: string
  procurementModeId: string | null
}

export type BacResolutionLogEntry = {
  id: string
  action: string
  actor: string
  timestamp: string
  note?: string | null
}


export type ResolutionClauseType = 'Whereas' | 'NowTherefore' | 'Resolved'

export type ResolutionClause = {
  id: string
  name: string
  body: string
  clauseType: ResolutionClauseType
}

export type WhereasClauseTemplate = ResolutionClause

export type BacResolutionClauseLink = {
  id: string
  resolutionClauseId: string
  name: string
  body: string
  clauseType: ResolutionClauseType
  order: number
}

export type AppItemLinkItem = {
  id: string
  appItemId: string
  itemNumber: string
  description: string
  officeName: string
  effectiveABC: number
  order: number
  appNumber: string
  appName: string
}

export type WhereasClauses = {
  whereasClauseId: string
  order: number
}

export type BacProject = {
  id: string
  sourceType: "APPItem" | "ConsolidatedPR"
  appItemId?: string
  consolidatedPRId?: string
  appItem?: APPItem
  consolidatedPR?: ConsolidatedPR
  title?: string
  abc: number
  appItemCount?: number
  sumABC?: number
  status?: BacResolutionStatus
  resolutionType?: string
  resolutionNumber?: string
  dateResolved?: string
  resolvedLocation?: string
  whereasClauses?: WhereasClauses[]
  endUserRepresentativeId?: string
  techRepresentativeId?: string
  createdBy?: string
  createdAt?: string
  updatedAt?: string
  updatedBy?: string
  approvedBy?: string
  approvedAt?: string
}

export type BacProjectDetails = BacProject & {
  appItemLinks?: AppItemLinkItem[]
  bacResolutions?: BacResolution[]
  biddingActivitySchedules?: {}[]
  endUserRepresentativeId?: string
  endUserRepresentative?: { id: string, firstName: string, lastName: string, email: string }
  techRepresentativeId?: string
  techRepresentative?: { id: string, firstName: string, lastName: string, email: string }
  approvalAttachmentFileId?: string
}

export type BacResolution = {
  id: string
  procurementProjectId: string
  resolutionType?: string
  resolutionNumber?: string
  dateResolved: string
  resolvedLocation?: string
  status: string
  whereasClauses: BacResolutionWhereasClause[]
  clauseLinks?: BacResolutionClauseLink[]
  biddingActivitySchedules: {}[]
  endUserRepresentativeId?: string
  endUserRepresentative: { id: string, firstName: string, lastName: string, email: string } | null
  techRepresentativeId?: string
  techRepresentative: { id: string, firstName: string, lastName: string, email: string } | null
}

export type BacResolutionWhereasClause = {
  id: string
  body?: string
  name?: string
}
export type LinkConsolidatedPrsPayload = {
  bacResolutionId: string
  consolidatedPRId: string
}

export type SubmitBacResolutionPayload = {
  status: string
}


export type ReturnBacResolutionPayload = {
  bacResolutionId: string
  reason: string
}

export type ApproveBacResolutionPayload = {
  attachmentFileId: string

}




export type PrintBacResolutionResult = {
  fileName: string
  blob: Blob
}
