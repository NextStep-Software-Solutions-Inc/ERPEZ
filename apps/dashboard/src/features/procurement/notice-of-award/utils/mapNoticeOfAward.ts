import type {
  NoticeOfAward,
  NoticeOfAwardStatus,
  NoticeOfAwardType,
  AwardBacResolutionSource,
  ConsolidatedPr,
  NoticeOfAwardLineItem,
  NoticeOfAwardLogEntry,
} from '../types'

export interface BackendNoticeOfAwardListDto {
  id: string
  noaNumber: string
  date: string
  dateBid: string
  description: string
  type: number | string
  status: number | string
  totalAmount: number
  supplierId: string
  supplierName: string
  bacResolutionId: string
  bacResolutionNumber: string
  prNumber: string
  projectName: string
  createdAt: string
  updatedAt?: string | null
  slaState?: {
    isIssued: boolean
    isComplete: boolean
    isOpen: boolean
    isOverdue: boolean
    requiresCascadeDecision: boolean
    issuedDate?: string | null
    deadlineDate?: string | null
    daysRemaining?: number | null
    elapsedDays?: number | null
    progressPercent: number
    completedMilestones: number
    totalMilestones: number
    pendingMilestoneLabels: string[]
    label: string
    tone: string
  }
}

export interface BackendNoticeOfAwardDetailDto {
  id: string
  noaNumber: string
  date: string
  dateBid: string
  description: string
  type: number | string
  status: number | string
  totalAmount: number
  supplierId: string
  supplierName: string
  awardCriterion: string
  awardedAmount: number

  bacResolutionId: string
  bacResolutionNumber: string
  bacResolutionDate: string
  bacResolutionDescription: string
  sourceAobNumber?: string | null

  procurementProjectId: string
  projectName: string
  projectDescription: string
  prNumber: string
  endUser: string
  modeOfProcurement: string
  approvedBudget: number

  approvedById?: string | null
  approvedByName?: string | null
  approvedAt?: string | null
  issuedAt?: string | null
  signedDocumentFileId?: string | null
  signedDocumentFileName?: string | null
  philgepsPostedAt?: string | null
  philgepsReferenceNumber?: string | null
  returnReason?: string | null

  contractExecutionDeadline?: string | null
  contractExecutionJustification?: string | null
  justificationLoggedAt?: string | null
  cascadeTriggeredAt?: string | null
  cascadeTriggeredByName?: string | null
  cascadeNote?: string | null

  lineItems: Array<{
    id: string
    itemName: string
    category: string
    description: string
    quantity: number
    unit: string
    unitPrice: number
    amount: number
  }>

  milestones: Array<{
    id: string
    noticeOfAwardId: string
    milestoneType: number | string
    milestoneKey: string
    dateLogged: string
    fileId?: string | null
    fileName?: string | null
    remarks?: string | null
    loggedByName?: string | null
  }>

  activityLog: Array<{
    id: string
    action: string
    actor: string
    timestamp: string
    note?: string | null
  }>

  conformeReceivedDate?: string | null
  conformeFileName?: string | null
  conformeFileId?: string | null
  performanceSecurityPostedDate?: string | null
  performanceSecurityFileName?: string | null
  performanceSecurityFileId?: string | null
  contractExecutionDate?: string | null
  contractFileName?: string | null
  contractFileId?: string | null

  createdAt: string
  updatedAt?: string | null
}

export interface BackendAvailableResolutionDto {
  id: string
  bacResolutionNumber: string
  resolutionDate: string
  description: string
  procurementProjectId: string
  projectName: string
  projectDescription: string
  prNumber: string
  endUser: string
  approvedBudget: number
  modeOfProcurement: string
  supplierId: string
  winningSupplierName: string
  awardedAmount: number
  awardCriterion: string
  sourceAobNumber?: string | null
  lineItems: Array<{
    id: string
    itemName: string
    category: string
    description: string
    quantity: number
    unit: string
    unitPrice: number
    amount: number
  }>
}

export function mapStatusToFrontend(status: number | string): NoticeOfAwardStatus {
  if (status === 0 || status === 'Draft' || status === 'draft') return 'draft'
  if (status === 1 || status === 'ForApproval' || status === 'for-approval') return 'for-approval'
  if (status === 2 || status === 'Returned' || status === 'returned') return 'returned'
  if (status === 3 || status === 'Approved' || status === 'approved') return 'approved'
  return 'draft'
}

export function mapTypeToFrontend(type: number | string): NoticeOfAwardType {
  if (type === 0 || type === 'GoodsAndServices' || type === 'goods-services') return 'goods-services'
  if (type === 1 || type === 'Infrastructure' || type === 'infrastructure') return 'infrastructure'
  if (type === 2 || type === 'Consulting' || type === 'consulting') return 'consulting'
  return 'goods-services'
}

export function mapTypeToBackend(type: NoticeOfAwardType): string {
  switch (type) {
    case 'goods-services': return 'GoodsAndServices'
    case 'infrastructure': return 'Infrastructure'
    case 'consulting': return 'Consulting'
    default: return 'GoodsAndServices'
  }
}

export function mapListDtoToNoticeOfAward(dto: BackendNoticeOfAwardListDto): NoticeOfAward {
  const status = mapStatusToFrontend(dto.status)
  const type = mapTypeToFrontend(dto.type)

  const linkedConsolidatedPr: ConsolidatedPr = {
    id: dto.id,
    prNumber: dto.prNumber || 'CPR-001',
    projectName: dto.projectName || 'Procurement Project',
    projectDescription: dto.description || '',
    endUser: 'Procurement Office',
    supplierName: dto.supplierName || 'Winning Bidder',
    modeOfProcurement: 'Public Bidding',
    status: 'approved',
    taggedForPublicBidding: true,
    approvedBudget: dto.totalAmount,
    lineItems: [],
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt || dto.createdAt,
  }

  return {
    id: dto.id,
    noaNumber: dto.noaNumber,
    date: dto.date,
    dateBid: dto.dateBid,
    description: dto.description,
    type,
    supplierName: dto.supplierName,
    status,
    totalAmount: dto.totalAmount,
    projectName: dto.projectName,
    projectDescription: dto.description,
    linkedBacResolution: {
      id: dto.bacResolutionId,
      bacResolutionNumber: dto.bacResolutionNumber,
      resolutionDate: dto.date,
      description: dto.description,
      resolutionType: 'award-recommendation',
      awardCriterion: 'LCRB',
    },
    linkedConsolidatedPr,
    lineItems: [],
    activityLog: [],
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt || dto.createdAt,
    contractExecutionDeadline: dto.slaState?.deadlineDate,
    issuedAt: dto.slaState?.issuedDate,
  }
}

export function mapDetailDtoToNoticeOfAward(dto: BackendNoticeOfAwardDetailDto): NoticeOfAward {
  const status = mapStatusToFrontend(dto.status)
  const type = mapTypeToFrontend(dto.type)

  const lineItems: NoticeOfAwardLineItem[] = (dto.lineItems || []).map((li) => ({
    id: li.id,
    itemName: li.itemName,
    category: li.category,
    description: li.description,
    quantity: li.quantity,
    unit: li.unit,
    unitPrice: li.unitPrice,
    amount: li.amount,
  }))

  const linkedConsolidatedPr: ConsolidatedPr = {
    id: dto.procurementProjectId,
    prNumber: dto.prNumber || 'CPR-001',
    projectName: dto.projectName,
    projectDescription: dto.projectDescription,
    endUser: dto.endUser,
    supplierName: dto.supplierName,
    modeOfProcurement: 'Public Bidding',
    status: 'approved',
    taggedForPublicBidding: true,
    approvedBudget: dto.approvedBudget,
    lineItems,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt || dto.createdAt,
  }

  const activityLog: NoticeOfAwardLogEntry[] = (dto.activityLog || []).map((a) => ({
    id: a.id,
    action: a.action,
    actor: a.actor,
    timestamp: a.timestamp,
    note: a.note,
  }))

  return {
    id: dto.id,
    noaNumber: dto.noaNumber,
    date: dto.date,
    dateBid: dto.dateBid,
    description: dto.description,
    type,
    supplierName: dto.supplierName,
    status,
    totalAmount: dto.totalAmount,
    projectName: dto.projectName,
    projectDescription: dto.projectDescription,
    linkedBacResolution: {
      id: dto.bacResolutionId,
      bacResolutionNumber: dto.bacResolutionNumber,
      resolutionDate: dto.bacResolutionDate,
      description: dto.bacResolutionDescription,
      resolutionType: 'award-recommendation',
      sourceAobNumber: dto.sourceAobNumber,
      awardCriterion: (dto.awardCriterion as 'LCRB' | 'MEARB') || 'LCRB',
    },
    linkedConsolidatedPr,
    lineItems,
    activityLog,
    returnReason: dto.returnReason,
    approvedBy: dto.approvedByName,
    approvedAt: dto.approvedAt,
    issuedAt: dto.issuedAt,
    contractExecutionDeadline: dto.contractExecutionDeadline,
    conformeReceivedDate: dto.conformeReceivedDate,
    conformeFileName: dto.conformeFileName,
    performanceSecurityPostedDate: dto.performanceSecurityPostedDate,
    performanceSecurityFileName: dto.performanceSecurityFileName,
    contractExecutionDate: dto.contractExecutionDate,
    contractFileName: dto.contractFileName,
    contractExecutionJustification: dto.contractExecutionJustification,
    cascadeTriggeredAt: dto.cascadeTriggeredAt,
    cascadeTriggeredBy: dto.cascadeTriggeredByName,
    cascadeNote: dto.cascadeNote,
    signedDocumentFileName: dto.signedDocumentFileName,
    philgepsPostedAt: dto.philgepsPostedAt,
    philgepsReferenceNumber: dto.philgepsReferenceNumber,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt || dto.createdAt,
  }
}

export function mapAvailableResolutionToSource(dto: BackendAvailableResolutionDto): AwardBacResolutionSource {
  const lineItems: NoticeOfAwardLineItem[] = (dto.lineItems || []).map((li) => ({
    id: li.id,
    itemName: li.itemName,
    category: li.category,
    description: li.description,
    quantity: li.quantity,
    unit: li.unit,
    unitPrice: li.unitPrice,
    amount: li.amount,
  }))

  const linkedConsolidatedPr: ConsolidatedPr = {
    id: dto.procurementProjectId,
    prNumber: dto.prNumber,
    projectName: dto.projectName,
    projectDescription: dto.projectDescription,
    endUser: dto.endUser,
    supplierName: dto.winningSupplierName,
    modeOfProcurement: 'Public Bidding',
    status: 'approved',
    taggedForPublicBidding: true,
    approvedBudget: dto.approvedBudget,
    lineItems,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return {
    id: dto.id,
    bacResolutionNumber: dto.bacResolutionNumber,
    resolutionDate: dto.resolutionDate,
    description: dto.projectName || dto.description,
    projectName: dto.projectName,
    resolutionType: 'award-recommendation',
    sourceAobNumber: dto.sourceAobNumber,
    awardCriterion: (dto.awardCriterion as 'LCRB' | 'MEARB') || 'LCRB',
    winningSupplierName: dto.winningSupplierName,
    awardedAmount: dto.awardedAmount,
    linkedConsolidatedPr,
    lineItems,
  }
}
