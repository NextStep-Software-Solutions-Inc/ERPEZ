import type {
  BacResolution,
  ConsolidatedPrLink,
} from '../../bac-resolution/types'
import {
  useConsolidatedPRStore,
  type ConsolidatedPR as StoreConsolidatedPR,
} from '../../consolidated-pr/store/consolidatedPRStore'
import { useBidEvaluationStore } from '../../bid-evaluation/store/bidEvaluationStore'
import { getSortedSuppliers } from '../../bid-evaluation/data/mockProjects'
import type {
  BacResolutionDraft,
  PublicBiddingProject,
  SupplierBid,
} from '../../bid-evaluation/types'
import type {
  AwardBacResolutionSource,
  ConsolidatedPr,
  NoticeOfAward,
  NoticeOfAwardBacResolutionLink,
  NoticeOfAwardLineItem,
  NoticeOfAwardLogEntry,
  NoticeOfAwardStatus,
  NoticeOfAwardType,
} from '../types'

const CONTRACT_EXECUTION_SLA_DAYS = 10

function roundMoney(value: number) {
  return Math.round(value * 100) / 100
}

function sumLineItems(lineItems: NoticeOfAwardLineItem[]) {
  return roundMoney(lineItems.reduce((total, item) => total + item.amount, 0))
}

function toDateOnly(value: string) {
  return value.includes('T') ? value.slice(0, 10) : value.split(' ')[0]
}

function addCalendarDays(dateValue: string, days: number) {
  const date = new Date(`${toDateOnly(dateValue)}T00:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function findStoreConsolidatedPr(
  linkedPr: ConsolidatedPrLink,
): StoreConsolidatedPR | null {
  return (
    useConsolidatedPRStore
      .getState()
      .consolidatedPRs.find(
        (candidate) =>
          candidate.id === linkedPr.id ||
          candidate.prNumber === linkedPr.prNumber,
      ) ?? null
  )
}

function mapStoreLineItemsToNoaLineItems(
  consolidatedPr: StoreConsolidatedPR,
): NoticeOfAwardLineItem[] {
  return consolidatedPr.selectedPRItems.map((item) => ({
    id: item.id,
    itemName: item.itemName,
    category: item.category,
    description: `${item.prNumber ?? item.prId} - ${item.prOffice}`,
    quantity: item.qty,
    unit: item.unit,
    unitPrice: item.unitPrice,
    amount: item.totalAmount,
  }))
}

function buildFallbackLineItems(
  linkedPr: ConsolidatedPrLink,
): NoticeOfAwardLineItem[] {
  return [
    {
      id: `${linkedPr.id}-award-line`,
      itemName: linkedPr.projectName,
      category: 'Public Bidding Package',
      description: linkedPr.description,
      quantity: 1,
      unit: 'lot',
      unitPrice: linkedPr.amount,
      amount: linkedPr.amount,
    },
  ]
}

function buildConsolidatedPrFromBacResolution(
  resolution: BacResolution,
  supplierName: string,
): ConsolidatedPr {
  const linkedPr = resolution.linkedConsolidatedPrs[0]
  const storePr = findStoreConsolidatedPr(linkedPr)
  const lineItems = storePr
    ? mapStoreLineItemsToNoaLineItems(storePr)
    : buildFallbackLineItems(linkedPr)

  return {
    id: linkedPr.id,
    prNumber: linkedPr.prNumber,
    projectName: linkedPr.projectName,
    projectDescription: linkedPr.description,
    endUser: linkedPr.endUser,
    supplierName,
    modeOfProcurement: 'Public Bidding',
    status: 'approved',
    taggedForPublicBidding:
      linkedPr.modeOfProcurement.trim().toLowerCase() === 'public bidding',
    approvedBudget: linkedPr.amount,
    lineItems,
    createdAt: storePr?.date ?? resolution.createdAt,
    updatedAt: resolution.updatedAt,
  }
}

function buildBacResolutionLink(
  resolution: BacResolution,
): NoticeOfAwardBacResolutionLink {
  return {
    id: resolution.id,
    bacResolutionNumber: resolution.bacResolutionNumber,
    resolutionDate: resolution.resolutionDate,
    description: resolution.description,
    resolutionType: 'award-recommendation',
    approvedBy: resolution.approvedBy ?? null,
    approvedAt: resolution.approvedAt ?? null,
    sourceAobNumber: resolution.awardRecommendation?.sourceAobNumber ?? null,
    postQualificationDate:
      resolution.awardRecommendation?.postQualificationDate ?? null,
    sourceModule: 'bac-resolution',
    sourceBidEvaluationProjectId: null,
    sourceBidEvaluationSupplierId: null,
    awardCriterion: 'LCRB',
  }
}

function buildAwardSourceFromResolution(
  resolution: BacResolution,
): AwardBacResolutionSource | null {
  if (
    resolution.status !== 'approved' ||
    resolution.resolutionType !== 'award-recommendation' ||
    !resolution.awardRecommendation ||
    resolution.linkedConsolidatedPrs.length !== 1
  ) {
    return null
  }

  const linkedConsolidatedPr = buildConsolidatedPrFromBacResolution(
    resolution,
    resolution.awardRecommendation.winningSupplierName,
  )
  const lineItems = linkedConsolidatedPr.lineItems.map((item) => ({ ...item }))

  return {
    ...buildBacResolutionLink(resolution),
    winningSupplierName: resolution.awardRecommendation.winningSupplierName,
    awardedAmount: roundMoney(resolution.awardRecommendation.awardedAmount),
    linkedConsolidatedPr,
    lineItems,
  }
}

function buildBidEvaluationProjectLineItems(
  project: PublicBiddingProject,
  lcrbAmount: number,
): NoticeOfAwardLineItem[] {
  return [
    {
      id: `${project.id}-public-bidding-package`,
      itemName: project.projectName,
      category: 'Public Bidding Package',
      description: `Approved Budget for the Contract source for ${project.resolutionNumber}`,
      quantity: 1,
      unit: 'lot',
      unitPrice: roundMoney(lcrbAmount),
      amount: roundMoney(lcrbAmount),
    },
  ]
}

function buildConsolidatedPrFromBidEvaluationProject(
  project: PublicBiddingProject,
  draft: BacResolutionDraft,
): ConsolidatedPr {
  const lineItems = buildBidEvaluationProjectLineItems(project, draft.lcrbAmount)

  return {
    id: `${project.id}-consolidated-pr`,
    prNumber: `CPR-${draft.resolutionNumber.replace('BAC-RES-', '')}`,
    projectName: project.projectName,
    projectDescription: `Public bidding award package recommended from ${project.resolutionNumber}.`,
    endUser: 'End User Office',
    supplierName: draft.winningSupplier,
    modeOfProcurement: 'Public Bidding',
    status: 'approved',
    taggedForPublicBidding: true,
    approvedBudget: roundMoney(project.abc),
    lineItems,
    createdAt: draft.draftedAt,
    updatedAt: draft.draftedAt,
  }
}

function findBidEvaluationWinner(
  project: PublicBiddingProject,
  draft: BacResolutionDraft,
): SupplierBid | null {
  return (
    project.suppliers.find(
      (supplier) => supplier.supplierName === draft.winningSupplier,
    ) ??
    getSortedSuppliers(
      project.suppliers,
      project.awardCriterion,
      project.technicalWeight,
      project.financialWeight,
    ).find((supplier) => supplier.status === 'LCRB') ??
    null
  )
}

function buildAwardSourceFromBidEvaluationProject(
  project: PublicBiddingProject,
): AwardBacResolutionSource | null {
  const draft = project.bacResolutionDraft

  if (!draft || (project.projectStatus !== 'Pending_HoPE_Approval' && project.projectStatus !== 'Approved')) {
    return null
  }

  const winner = findBidEvaluationWinner(project, draft)

  if (!winner || roundMoney(draft.lcrbAmount) > roundMoney(project.abc)) {
    return null
  }

  const linkedConsolidatedPr = buildConsolidatedPrFromBidEvaluationProject(
    project,
    draft,
  )
  const draftedDate = toDateOnly(draft.draftedAt)

  return {
    id: `bid-evaluation-${project.id}`,
    bacResolutionNumber: draft.resolutionNumber,
    resolutionDate: draftedDate,
    description: `Approved award recommendation generated from bid evaluation for ${project.projectName}.`,
    resolutionType: 'award-recommendation',
    approvedBy: 'HoPE',
    approvedAt: draft.draftedAt,
    sourceAobNumber: `AOB-${draft.resolutionNumber.replace('BAC-RES-', '')}`,
    postQualificationDate: winner.postQualDocsReceivedDate
      ? toDateOnly(winner.postQualDocsReceivedDate)
      : draftedDate,
    sourceModule: 'bid-evaluation',
    sourceBidEvaluationProjectId: project.id,
    sourceBidEvaluationSupplierId: winner.supplierId,
    winningSupplierName: draft.winningSupplier,
    awardedAmount: roundMoney(draft.lcrbAmount),
    linkedConsolidatedPr,
    lineItems: linkedConsolidatedPr.lineItems.map((item) => ({ ...item })),
    awardCriterion: project.awardCriterion,
  }
}

function getBidEvaluationAwardBacResolutionSources() {
  return useBidEvaluationStore
    .getState()
    .projects.map(buildAwardSourceFromBidEvaluationProject)
    .filter((source): source is AwardBacResolutionSource => source !== null)
}

function cloneBacResolutionLink(
  link: NoticeOfAwardBacResolutionLink,
): NoticeOfAwardBacResolutionLink {
  return { ...link }
}

function cloneAwardBacResolutionSource(
  source: AwardBacResolutionSource,
): AwardBacResolutionSource {
  return {
    ...source,
    linkedConsolidatedPr: cloneConsolidatedPr(source.linkedConsolidatedPr),
    lineItems: source.lineItems.map((item) => cloneNoticeOfAwardLineItem(item)),
  }
}

function createLogEntry(
  id: string,
  action: string,
  actor: string,
  note?: string | null,
): NoticeOfAwardLogEntry {
  return {
    id,
    action,
    actor,
    timestamp: new Date().toISOString(),
    note: note ?? null,
  }
}

function buildNoticeOfAward(
  id: string,
  props: {
    noaNumber: string
    date: string
    dateBid: string
    description: string
    type: NoticeOfAwardType
    status: NoticeOfAwardStatus
    awardSource: AwardBacResolutionSource
    createdAt: string
    updatedAt: string
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
  },
): NoticeOfAward {
  const linkedConsolidatedPr = cloneConsolidatedPr(
    props.awardSource.linkedConsolidatedPr,
  )
  const lineItems = props.awardSource.lineItems.map((item) => ({ ...item }))
  const issuedAt = props.issuedAt ?? null

  return {
    id,
    noaNumber: props.noaNumber,
    date: props.date,
    dateBid: props.dateBid,
    description: props.description,
    type: props.type,
    supplierName: props.awardSource.winningSupplierName,
    status: props.status,
    totalAmount: props.awardSource.awardedAmount,
    linkedBacResolution: cloneBacResolutionLink(props.awardSource),
    linkedConsolidatedPr,
    lineItems,
    projectName: linkedConsolidatedPr.projectName,
    projectDescription: linkedConsolidatedPr.projectDescription,
    createdAt: props.createdAt,
    updatedAt: props.updatedAt,
    activityLog: [
      createLogEntry(`${id}-log-1`, 'Created draft', 'Procurement Staff'),
    ],
    returnReason: props.returnReason ?? null,
    approvedBy: props.approvedBy ?? null,
    approvedAt: props.approvedAt ?? null,
    issuedAt,
    contractExecutionDeadline:
      props.contractExecutionDeadline ??
      (issuedAt
        ? addCalendarDays(issuedAt, CONTRACT_EXECUTION_SLA_DAYS)
        : null),
    conformeReceivedDate: props.conformeReceivedDate ?? null,
    performanceSecurityPostedDate: props.performanceSecurityPostedDate ?? null,
    contractExecutionDate: props.contractExecutionDate ?? null,
    contractExecutionJustification:
      props.contractExecutionJustification ?? null,
    cascadeTriggeredAt: props.cascadeTriggeredAt ?? null,
    cascadeTriggeredBy: props.cascadeTriggeredBy ?? null,
    cascadeNote: props.cascadeNote ?? null,
    signedDocumentFileName: props.signedDocumentFileName ?? null,
    conformeFileName: props.conformeFileName ?? null,
    performanceSecurityFileName: props.performanceSecurityFileName ?? null,
    contractFileName: props.contractFileName ?? null,
    philgepsPostedAt: props.philgepsPostedAt ?? null,
    philgepsReferenceNumber: props.philgepsReferenceNumber ?? null,
    printFileName: props.printFileName ?? null,
  }
}

function requireAwardSource(
  sources: AwardBacResolutionSource[],
  index: number,
) {
  const source = sources[index] ?? sources[index % sources.length]

  if (!source) {
    throw new Error(
      'Missing approved BAC Resolution award source for NOA seed.',
    )
  }

  return source
}

function buildSeededNoticeOfAwardDatabase() {
  const awardSources = getApprovedAwardBacResolutionSources()

  if (awardSources.length === 0) {
    return []
  }

  return [
    buildNoticeOfAward('noa-001', {
      noaNumber: 'NOA-2026-001',
      date: '2026-06-02',
      dateBid: '2026-05-24',
      description: 'Award of procurement package for IT equipment supply.',
      type: 'goods-services',
      status: 'draft',
      awardSource: requireAwardSource(awardSources, 0),
      createdAt: '2026-06-02 09:12',
      updatedAt: '2026-06-02 09:12',
    }),
    buildNoticeOfAward('noa-002', {
      noaNumber: 'NOA-2026-002',
      date: '2026-06-05',
      dateBid: '2026-05-28',
      description: 'Award notice for infrastructure support package.',
      type: 'infrastructure',
      status: 'for-approval',
      awardSource: requireAwardSource(awardSources, 1),
      createdAt: '2026-06-05 14:25',
      updatedAt: '2026-06-06 08:40',
    }),
    buildNoticeOfAward('noa-003', {
      noaNumber: 'NOA-2026-003',
      date: '2026-06-07',
      dateBid: '2026-05-31',
      description: 'Consulting award for procurement workflow enhancement.',
      type: 'consulting',
      status: 'returned',
      awardSource: requireAwardSource(awardSources, 2),
      createdAt: '2026-06-07 10:05',
      updatedAt: '2026-06-08 16:15',
      returnReason: 'Update the award source remarks before resubmission.',
    }),
    buildNoticeOfAward('noa-004', {
      noaNumber: 'NOA-2026-004',
      date: '2026-06-10',
      dateBid: '2026-06-01',
      description: 'Final signed award for the public bidding package.',
      type: 'goods-services',
      status: 'approved',
      awardSource: requireAwardSource(awardSources, 3),
      createdAt: '2026-06-10 11:00',
      updatedAt: '2026-06-12 09:30',
      approvedBy: 'HOPE',
      approvedAt: '2026-06-10T09:30:00.000Z',
      issuedAt: '2026-06-10T09:30:00.000Z',
      conformeReceivedDate: '2026-06-12',
      performanceSecurityPostedDate: '2026-06-14',
      signedDocumentFileName: 'NOA-2026-004-signed.pdf',
      conformeFileName: 'NOA-2026-004-conforme.pdf',
      performanceSecurityFileName: 'NOA-2026-004-performance-security.pdf',
      philgepsPostedAt: '2026-06-10',
      philgepsReferenceNumber: 'PHILGEPS-NOA-2026-004',
      printFileName: 'NOA-2026-004.pdf',
    }),
    buildNoticeOfAward('noa-005', {
      noaNumber: 'NOA-2026-005',
      date: '2026-06-12',
      dateBid: '2026-06-02',
      description: 'Award notice for solar power installation project.',
      type: 'infrastructure',
      status: 'for-approval',
      awardSource: requireAwardSource(awardSources, 4),
      createdAt: '2026-06-12 13:10',
      updatedAt: '2026-06-12 15:40',
    }),
    buildNoticeOfAward('noa-006', {
      noaNumber: 'NOA-2026-006',
      date: '2026-06-14',
      dateBid: '2026-06-04',
      description: 'Award recommendation for high-density networking switch gears.',
      type: 'goods-services',
      status: 'for-approval',
      awardSource: requireAwardSource(awardSources, 5),
      createdAt: '2026-06-14 09:00',
      updatedAt: '2026-06-14 10:20',
    }),
    buildNoticeOfAward('noa-007', {
      noaNumber: 'NOA-2026-007',
      date: '2026-06-15',
      dateBid: '2026-06-05',
      description: 'Award notice for classroom building extension phase 2.',
      type: 'infrastructure',
      status: 'for-approval',
      awardSource: requireAwardSource(awardSources, 6),
      createdAt: '2026-06-15 11:30',
      updatedAt: '2026-06-15 14:00',
    }),
    buildNoticeOfAward('noa-008', {
      noaNumber: 'NOA-2026-008',
      date: '2026-06-16',
      dateBid: '2026-06-06',
      description: 'Award of procurement package for laboratory glasswares.',
      type: 'goods-services',
      status: 'draft',
      awardSource: requireAwardSource(awardSources, 7),
      createdAt: '2026-06-16 09:00',
      updatedAt: '2026-06-16 09:00',
    }),
    buildNoticeOfAward('noa-009', {
      noaNumber: 'NOA-2026-009',
      date: '2026-06-18',
      dateBid: '2026-06-08',
      description: 'Consulting award for institutional quality assurance evaluation.',
      type: 'consulting',
      status: 'returned',
      awardSource: requireAwardSource(awardSources, 8),
      createdAt: '2026-06-18 10:15',
      updatedAt: '2026-06-19 11:20',
      returnReason: 'Clarify the timeline of deliverables in the main text.',
    }),
    buildNoticeOfAward('noa-010', {
      noaNumber: 'NOA-2026-010',
      date: '2026-06-20',
      dateBid: '2026-06-10',
      description: 'Final signed award notice for office desktop supplies.',
      type: 'goods-services',
      status: 'approved',
      awardSource: requireAwardSource(awardSources, 9),
      createdAt: '2026-06-20 14:00',
      updatedAt: '2026-06-21 16:30',
      approvedBy: 'HOPE',
      approvedAt: '2026-06-20T16:30:00.000Z',
      issuedAt: '2026-06-20T16:30:00.000Z',
      conformeReceivedDate: '2026-06-22',
      signedDocumentFileName: 'NOA-2026-010-signed.pdf',
      conformeFileName: 'NOA-2026-010-conforme.pdf',
    }),
  ]
}

export const uploadedNoaFilesMap = new Map<string, File>()
export const uploadedMilestoneFilesMap = new Map<string, File>()

let mockNoticeOfAwardDatabase: NoticeOfAward[] | null = null
let noaSequence = 1

function getMutableNoticeOfAwardDatabase() {
  if (!mockNoticeOfAwardDatabase) {
    mockNoticeOfAwardDatabase = buildSeededNoticeOfAwardDatabase()
    noaSequence = mockNoticeOfAwardDatabase.length + 1
  }

  return mockNoticeOfAwardDatabase
}

export function cloneNoticeOfAwardLineItem(
  item: NoticeOfAwardLineItem,
): NoticeOfAwardLineItem {
  return { ...item }
}

export function cloneConsolidatedPr(pr: ConsolidatedPr): ConsolidatedPr {
  return {
    ...pr,
    lineItems: pr.lineItems.map((item) => cloneNoticeOfAwardLineItem(item)),
  }
}

export function cloneNoticeOfAward(noa: NoticeOfAward): NoticeOfAward {
  return {
    ...noa,
    linkedBacResolution: cloneBacResolutionLink(noa.linkedBacResolution),
    linkedConsolidatedPr: cloneConsolidatedPr(noa.linkedConsolidatedPr),
    lineItems: noa.lineItems.map((item) => cloneNoticeOfAwardLineItem(item)),
    activityLog: noa.activityLog.map((entry) => ({ ...entry })),
  }
}

export function getApprovedAwardBacResolutionSources() {
  const sourceMap = new Map<string, AwardBacResolutionSource>()

  getBidEvaluationAwardBacResolutionSources().forEach((source) => {
    sourceMap.set(source.bacResolutionNumber, source)
  })

  return Array.from(sourceMap.values()).map((source) =>
    cloneAwardBacResolutionSource(source),
  )
}

export function findApprovedAwardBacResolutionSourceById(
  bacResolutionId: string,
) {
  return (
    getApprovedAwardBacResolutionSources().find(
      (source) => source.id === bacResolutionId,
    ) ?? null
  )
}

export function getNoticeOfAwardDatabase() {
  return getMutableNoticeOfAwardDatabase().map((noa) => cloneNoticeOfAward(noa))
}

export function findNoticeOfAwardIndex(noaId: string) {
  return getMutableNoticeOfAwardDatabase().findIndex(
    (item) => item.id === noaId,
  )
}

export function findNoticeOfAward(noaId: string) {
  const noticeOfAward = getMutableNoticeOfAwardDatabase().find(
    (item) => item.id === noaId,
  )

  return noticeOfAward ? cloneNoticeOfAward(noticeOfAward) : null
}

export function createNoticeOfAwardFromBacResolution(input: {
  noaNumber: string
  date: string
  dateBid: string
  description: string
  type: NoticeOfAwardType
  awardSource: AwardBacResolutionSource
}) {
  const database = getMutableNoticeOfAwardDatabase()
  const createdAt = `${input.date} 08:00`
  const noticeOfAward = buildNoticeOfAward(
    `noa-${String(noaSequence++).padStart(3, '0')}`,
    {
      noaNumber: input.noaNumber,
      date: input.date,
      dateBid: input.dateBid,
      description: input.description,
      type: input.type,
      status: 'draft',
      awardSource: input.awardSource,
      createdAt,
      updatedAt: createdAt,
    },
  )

  database.unshift(noticeOfAward)

  return cloneNoticeOfAward(noticeOfAward)
}

export function replaceNoticeOfAward(updatedNoticeOfAward: NoticeOfAward) {
  const database = getMutableNoticeOfAwardDatabase()
  const index = findNoticeOfAwardIndex(updatedNoticeOfAward.id)

  if (index >= 0) {
    database[index] = cloneNoticeOfAward(updatedNoticeOfAward)
  }

  return cloneNoticeOfAward(updatedNoticeOfAward)
}
