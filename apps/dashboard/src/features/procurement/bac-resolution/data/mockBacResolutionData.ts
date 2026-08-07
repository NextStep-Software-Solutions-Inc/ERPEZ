import { useConsolidatedPRStore } from '../../consolidated-pr/store/consolidatedPRStore'
import type {
  BacResolution,
  BacResolutionAwardRecommendation,
  BacResolutionType,
  ConsolidatedPrLink,
  WhereasClauseTemplate,
} from '../types'

function formatModeOfProcurement(
  itemMops:
    | Record<string, { mop?: string; allowPartial?: boolean }>
    | undefined,
) {
  const firstMode = Object.values(itemMops ?? {}).find((item) => item.mop)?.mop

  if (!firstMode) {
    return 'Public Bidding'
  }

  return firstMode
    .split('-')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function mapApprovedConsolidatedPRToLink(
  consolidatedPr: ReturnType<
    typeof useConsolidatedPRStore.getState
  >['consolidatedPRs'][number],
): ConsolidatedPrLink {
  const amount = consolidatedPr.selectedPRItems.reduce(
    (total, item) => total + item.totalAmount,
    0,
  )

  return {
    id: consolidatedPr.id,
    prNumber: consolidatedPr.prNumber ?? consolidatedPr.id,
    description:
      consolidatedPr.description ??
      consolidatedPr.purpose ??
      consolidatedPr.prNumber ??
      consolidatedPr.id,
    endUser:
      consolidatedPr.selectedPRItems[0]?.prOffice ?? 'Procurement Office',
    projectName:
      consolidatedPr.purpose ??
      consolidatedPr.description ??
      consolidatedPr.prNumber ??
      consolidatedPr.id,
    amount,
    modeOfProcurement: formatModeOfProcurement(consolidatedPr.itemMOPs),
    status: 'approved',
  }
}

const SEED_TIMESTAMP = '2026-05-21T09:00:00.000Z'

type ResolutionSeed = {
  id: string
  bacResolutionNumber: string
  resolutionType?: BacResolutionType
  resolutionDate: string
  description: string
  status: BacResolution['status']
  preferredPrIndex?: number
  preferredPrNumber?: string
  activityNote: string
  returnReason?: string
  approvedBy?: string
  approvedAt?: string
  signedDocumentFileName?: string
  printFileName?: string
  workspaceOrigin?: 'public-bidding' | 'standard' | null
  awardRecommendation?: Partial<BacResolutionAwardRecommendation>
}

const AWARD_RECOMMENDATION_SUPPLIERS = [
  'Nexus Tech Supplies',
  'BuildPoint Constructors',
  'StrategyLoop Consulting',
  'Northstar Systems Inc.',
  'CivicWorks Builders',
  'MedSupply Central',
  'SecureGrid Technologies',
  'RoadLink Infrastructure',
  'Bluewater Engineering',
  'SignalWorks Philippines',
  'DrainagePro Materials',
  'HydroPlan Consulting',
]

const AWARD_RECOMMENDATION_RESOLUTION_IDS = new Set([
  'bac-resolution-004',
  'bac-resolution-005',
  'bac-resolution-006',
  'bac-resolution-007',
  'bac-resolution-008',
  'bac-resolution-009',
  'bac-resolution-010',
  'bac-resolution-011',
  'bac-resolution-012',
  'bac-resolution-013',
  'bac-resolution-014',
  'bac-resolution-015',
  'bac-resolution-016',
  'bac-resolution-017',
])

function resolveSeedResolutionType(seed: ResolutionSeed): BacResolutionType {
  if (seed.resolutionType) {
    return seed.resolutionType
  }

  return AWARD_RECOMMENDATION_RESOLUTION_IDS.has(seed.id)
    ? 'award-recommendation'
    : 'procurement-mode-recommendation'
}

function buildAwardRecommendation(
  seed: ResolutionSeed,
  linkedPr: ConsolidatedPrLink,
  index: number,
): BacResolutionAwardRecommendation | null {
  if (resolveSeedResolutionType(seed) !== 'award-recommendation') {
    return null
  }

  return {
    winningSupplierName:
      seed.awardRecommendation?.winningSupplierName ??
      AWARD_RECOMMENDATION_SUPPLIERS[
        index % AWARD_RECOMMENDATION_SUPPLIERS.length
      ],
    awardedAmount: seed.awardRecommendation?.awardedAmount ?? linkedPr.amount,
    sourceAobNumber:
      seed.awardRecommendation?.sourceAobNumber ??
      `AOB-${seed.bacResolutionNumber.replace('BAC-RES-', '')}`,
    postQualificationDate:
      seed.awardRecommendation?.postQualificationDate ?? seed.resolutionDate,
  }
}

const RESOLUTION_SEEDS: Array<ResolutionSeed> = [
  {
    id: 'bac-resolution-001',
    bacResolutionNumber: 'BAC-RES-2026-001',
    resolutionDate: '2026-04-05',
    description:
      'Draft BAC resolution for the onboarding workstation and office support package.',
    status: 'draft',
    preferredPrIndex: 1,
    activityNote:
      'Created as the editable draft scenario for exact-one linking.',
  },
  {
    id: 'bac-resolution-002',
    bacResolutionNumber: 'BAC-RES-2026-002',
    resolutionDate: '2026-04-09',
    description:
      'BAC resolution awaiting chairperson review for the records digitization package.',
    status: 'for-approval',
    preferredPrIndex: 2,
    activityNote: 'Printed document routed for signature.',
    printFileName: 'BAC-RES-2026-002.pdf',
  },
  {
    id: 'bac-resolution-003',
    bacResolutionNumber: 'BAC-RES-2026-003',
    resolutionDate: '2026-04-12',
    description:
      'Returned BAC resolution for the HR development services package.',
    status: 'returned',
    preferredPrIndex: 3,
    activityNote: 'Returned pending signed attachment and wording correction.',
    returnReason:
      'Upload the signed document and update the recommendation note.',
  },
  {
    id: 'bac-resolution-004',
    bacResolutionNumber: 'BAC-RES-2026-004',
    resolutionDate: '2026-04-16',
    description:
      'Approved BAC resolution linked to a Public Bidding CPR and waiting for schedule generation.',
    status: 'approved',
    preferredPrIndex: 0,
    activityNote: 'Approved and queued for schedule generation.',
    approvedBy: 'Chairperson Demo',
    approvedAt: SEED_TIMESTAMP,
    signedDocumentFileName: 'BAC-RES-2026-004-signed.pdf',
    printFileName: 'BAC-RES-2026-004.pdf',
  },
  {
    id: 'bac-resolution-005',
    bacResolutionNumber: 'BAC-RES-2026-005',
    resolutionDate: '2026-04-18',
    description:
      'Approved BAC resolution linked to a Public Bidding CPR and still awaiting initial schedule setup.',
    status: 'approved',
    preferredPrIndex: 5,
    activityNote: 'Approved and pending first schedule generation.',
    approvedBy: 'Chairperson Demo',
    approvedAt: SEED_TIMESTAMP,
    signedDocumentFileName: 'BAC-RES-2026-005-signed.pdf',
    printFileName: 'BAC-RES-2026-005.pdf',
  },
  {
    id: 'bac-resolution-006',
    bacResolutionNumber: 'BAC-RES-2026-006',
    resolutionDate: '2026-04-20',
    description:
      'Approved BAC resolution linked to a Public Bidding CPR for the completed workflow demo and still waiting for schedule creation.',
    status: 'approved',
    preferredPrIndex: 8,
    activityNote: 'Approved with no bidding schedule created yet.',
    approvedBy: 'Chairperson Demo',
    approvedAt: SEED_TIMESTAMP,
    signedDocumentFileName: 'BAC-RES-2026-006-signed.pdf',
    printFileName: 'BAC-RES-2026-006.pdf',
  },
  {
    id: 'bac-resolution-007',
    bacResolutionNumber: 'BAC-RES-2026-007',
    resolutionDate: '2026-04-22',
    description:
      'Approved BAC resolution linked to a Public Bidding CPR and held for scheduling by the BAC secretariat.',
    status: 'approved',
    preferredPrIndex: 9,
    activityNote: 'Approved with no schedule yet; ready for scheduling intake.',
    approvedBy: 'Chairperson Demo',
    approvedAt: SEED_TIMESTAMP,
    signedDocumentFileName: 'BAC-RES-2026-007-signed.pdf',
    printFileName: 'BAC-RES-2026-007.pdf',
  },
  {
    id: 'bac-resolution-008',
    bacResolutionNumber: 'BAC-RES-2026-008',
    resolutionDate: '2026-04-24',
    description:
      'Approved BAC resolution linked to a Public Bidding CPR for medical supplies and not yet scheduled.',
    status: 'approved',
    preferredPrIndex: 10,
    activityNote: 'Approved and still waiting for bidding schedule generation.',
    approvedBy: 'Chairperson Demo',
    approvedAt: SEED_TIMESTAMP,
    signedDocumentFileName: 'BAC-RES-2026-008-signed.pdf',
    printFileName: 'BAC-RES-2026-008.pdf',
  },
  {
    id: 'bac-resolution-009',
    bacResolutionNumber: 'BAC-RES-2026-009',
    resolutionDate: '2026-04-26',
    description:
      'Approved BAC resolution linked to a Public Bidding CPR and retained as an unscheduled intake case.',
    status: 'approved',
    preferredPrIndex: 11,
    activityNote: 'Approved and queued with no schedule yet.',
    approvedBy: 'Chairperson Demo',
    approvedAt: SEED_TIMESTAMP,
    signedDocumentFileName: 'BAC-RES-2026-009-signed.pdf',
    printFileName: 'BAC-RES-2026-009.pdf',
  },
  {
    id: 'bac-resolution-010',
    bacResolutionNumber: 'BAC-RES-2026-010',
    resolutionDate: '2026-04-27',
    description:
      'Approved BAC resolution linked to a Public Bidding CPR and still pending schedule creation.',
    status: 'approved',
    preferredPrIndex: 12,
    activityNote: 'Approved and unscheduled pending BAC calendar assignment.',
    approvedBy: 'Chairperson Demo',
    approvedAt: SEED_TIMESTAMP,
    signedDocumentFileName: 'BAC-RES-2026-010-signed.pdf',
    printFileName: 'BAC-RES-2026-010.pdf',
  },
  {
    id: 'bac-resolution-011',
    bacResolutionNumber: 'BAC-RES-2026-011',
    resolutionDate: '2026-04-29',
    description:
      'Approved BAC resolution kept for higher-density infrastructure planning checks.',
    status: 'approved',
    preferredPrIndex: 4,
    activityNote: 'Reserved for workload and density validation in TC-03.',
    approvedBy: 'Chairperson Demo',
    approvedAt: SEED_TIMESTAMP,
    signedDocumentFileName: 'BAC-RES-2026-011-signed.pdf',
    printFileName: 'BAC-RES-2026-011.pdf',
  },
  {
    id: 'bac-resolution-012',
    bacResolutionNumber: 'BAC-RES-2026-012',
    resolutionDate: '2026-05-01',
    description:
      'Approved BAC resolution for the completed emergency response radio package. It is locked in the calendar.',
    status: 'approved',
    preferredPrIndex: 6,
    activityNote: 'Completed scenario with posted bidding document support.',
    approvedBy: 'Chairperson Demo',
    approvedAt: SEED_TIMESTAMP,
    signedDocumentFileName: 'BAC-RES-2026-012-signed.pdf',
    printFileName: 'BAC-RES-2026-012.pdf',
  },
  {
    id: 'bac-resolution-013',
    bacResolutionNumber: 'BAC-RES-2026-013',
    resolutionDate: '2026-05-03',
    description:
      'Approved BAC resolution for the half-way IT backbone expansion package.',
    status: 'approved',
    preferredPrIndex: 7,
    activityNote: 'Halfway scenario with a confirmed schedule only.',
    approvedBy: 'Chairperson Demo',
    approvedAt: SEED_TIMESTAMP,
    signedDocumentFileName: 'BAC-RES-2026-013-signed.pdf',
    printFileName: 'BAC-RES-2026-013.pdf',
  },
  {
    id: 'bac-resolution-014',
    bacResolutionNumber: 'BAC-RES-2026-014',
    resolutionDate: '2026-05-05',
    description:
      'Approved BAC resolution for the regional CCTV expansion package with prior-month milestones now slipping into overdue state.',
    status: 'approved',
    preferredPrIndex: 13,
    activityNote:
      'Confirmed public bidding schedule retained as the overdue demo case.',
    approvedBy: 'Chairperson Demo',
    approvedAt: SEED_TIMESTAMP,
    signedDocumentFileName: 'BAC-RES-2026-014-signed.pdf',
    printFileName: 'BAC-RES-2026-014.pdf',
  },
  {
    id: 'bac-resolution-015',
    bacResolutionNumber: 'BAC-RES-2026-015',
    resolutionDate: '2026-05-07',
    description:
      'Approved BAC resolution for the traffic signal controller replacement package with a due-soon milestone window.',
    status: 'approved',
    preferredPrIndex: 14,
    activityNote:
      'Confirmed public bidding schedule reserved for the due-soon milestone demo.',
    approvedBy: 'Chairperson Demo',
    approvedAt: SEED_TIMESTAMP,
    signedDocumentFileName: 'BAC-RES-2026-015-signed.pdf',
    printFileName: 'BAC-RES-2026-015.pdf',
  },
  {
    id: 'bac-resolution-016',
    bacResolutionNumber: 'BAC-RES-2026-016',
    resolutionDate: '2026-05-09',
    description:
      'Approved BAC resolution for drainage rehabilitation materials with later pending milestones still ahead.',
    status: 'approved',
    preferredPrIndex: 15,
    activityNote:
      'Confirmed public bidding schedule seeded for pending future milestone review.',
    approvedBy: 'Chairperson Demo',
    approvedAt: SEED_TIMESTAMP,
    signedDocumentFileName: 'BAC-RES-2026-016-signed.pdf',
    printFileName: 'BAC-RES-2026-016.pdf',
  },
  {
    id: 'bac-resolution-017',
    bacResolutionNumber: 'BAC-RES-2026-017',
    resolutionDate: '2026-05-12',
    description:
      'Approved BAC resolution for flood control design consultancy with a fully completed and locked schedule.',
    status: 'approved',
    preferredPrIndex: 16,
    activityNote:
      'Locked public bidding schedule seeded as the completed historical demo case.',
    approvedBy: 'Chairperson Demo',
    approvedAt: SEED_TIMESTAMP,
    signedDocumentFileName: 'BAC-RES-2026-017-signed.pdf',
    printFileName: 'BAC-RES-2026-017.pdf',
  },
  {
    id: 'bac-resolution-018',
    bacResolutionNumber: 'BAC-RES-2026-018',
    resolutionDate: '2026-05-20',
    description:
      'Draft BAC resolution for water distribution system rehabilitation — provisional schedule available.',
    status: 'draft',
    preferredPrIndex: 17,
    activityNote:
      'Draft with Public Bidding CPR linked. Provisional schedule seeded for draft-mode scheduling demo.',
    workspaceOrigin: 'public-bidding',
  },
  {
    id: 'bac-resolution-019',
    bacResolutionNumber: 'BAC-RES-2026-019',
    resolutionDate: '2026-05-20',
    description:
      'Draft BAC resolution for road signage and markings installation — pending provisional schedule generation.',
    status: 'draft',
    preferredPrIndex: 18,
    activityNote:
      'Draft with Public Bidding CPR linked. No provisional schedule generated yet — use Generate to demo draft scheduling.',
    workspaceOrigin: 'public-bidding',
  },
  {
    id: 'bac-resolution-020',
    bacResolutionNumber: 'BAC-RES-2026-020',
    resolutionDate: '2026-05-15',
    description:
      'Approved BAC Resolution for Direct Acquisition office supplies.',
    status: 'approved',
    preferredPrNumber: 'CPR-2026-DA01',
    activityNote:
      'Approved BAC Resolution for direct acquisition of office consumables.',
    approvedBy: 'Chairperson Demo',
    approvedAt: SEED_TIMESTAMP,
    signedDocumentFileName: 'BAC-RES-2026-020-signed.pdf',
    printFileName: 'BAC-RES-2026-020.pdf',
  },
  {
    id: 'bac-resolution-021',
    bacResolutionNumber: 'BAC-RES-2026-021',
    resolutionDate: '2026-05-21',
    description:
      'Approved BAC Resolution for Direct Acquisition IT peripherals.',
    status: 'approved',
    preferredPrNumber: 'CPR-2026-DA02',
    activityNote:
      'Approved BAC Resolution for direct acquisition of replacement IT peripherals.',
    approvedBy: 'Chairperson Demo',
    approvedAt: SEED_TIMESTAMP,
    signedDocumentFileName: 'BAC-RES-2026-021-signed.pdf',
    printFileName: 'BAC-RES-2026-021.pdf',
  },
]

const DEFAULT_WHEREAS_CLAUSE_TEMPLATES: WhereasClauseTemplate[] = [
  {
    id: 'template-001',
    name: 'Legal Basis',
    body: 'WHEREAS, Section 12 of the Revised IRR of R.A. 9184 provides that the BAC shall recommend to the Head of the Procuring Entity the use of Alternative Methods of Procurement as provided for in the Rules;',
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
  {
    id: 'template-002',
    name: 'Requirement Review',
    body: 'WHEREAS, the BAC has reviewed the procurement requirement reflected in the selected BAC Resolution and has confirmed that the linked Consolidated PRs support the recommended mode of procurement;',
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
]

let mockWhereasClauseDatabase: Array<WhereasClauseTemplate> | null = null

export const getMockWhereasClauseDatabase =
  (): Array<WhereasClauseTemplate> => {
    if (!mockWhereasClauseDatabase) {
      mockWhereasClauseDatabase = [...DEFAULT_WHEREAS_CLAUSE_TEMPLATES]
    }

    return mockWhereasClauseDatabase
  }

export const resetMockWhereasClauseDatabase = () => {
  mockWhereasClauseDatabase = null
}

export const getMockWhereasClauseTemplateById = (id: string) =>
  getMockWhereasClauseDatabase().find((item) => item.id === id)

/**
 * Lazily build the consolidated PR pool from the Zustand store at call-time.
 * This avoids reading the store at module-evaluation time (pre-hydration).
 */
export const getConsolidatedPrPool = (): Array<ConsolidatedPrLink> => {
  const approvedConsolidatedPRs = useConsolidatedPRStore
    .getState()
    .getApprovedConsolidatedPRs()

  return approvedConsolidatedPRs.map(mapApprovedConsolidatedPRToLink)
}

export const getMockConsolidatedPrDatabase = (): Array<ConsolidatedPrLink> => [
  ...getConsolidatedPrPool(),
]

function buildSeededDatabase(): Array<BacResolution> {
  const pool = getConsolidatedPrPool()
  const assignedLinkedPrIds = new Set<string>()

  return RESOLUTION_SEEDS.map((seed, index) => {
    const linkedPr = seed.preferredPrNumber
      ? pool.find((pr) => pr.prNumber === seed.preferredPrNumber)
      : pool.at(seed.preferredPrIndex ?? -1)

    if (!linkedPr) {
      throw new Error(
        `Missing linked Consolidated PR for ${seed.bacResolutionNumber}.`,
      )
    }

    if (assignedLinkedPrIds.has(linkedPr.id)) {
      throw new Error(
        `Duplicate Consolidated PR link detected for ${seed.bacResolutionNumber}.`,
      )
    }

    assignedLinkedPrIds.add(linkedPr.id)

    const resolvedDateText = new Date(seed.resolutionDate).toLocaleDateString(
      'en-PH',
      {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      },
    )

    return {
      id: seed.id,
      bacResolutionNumber: seed.bacResolutionNumber,
      resolutionType: resolveSeedResolutionType(seed),
      resolutionDate: seed.resolutionDate,
      description: seed.description,
      resolvedDateText,
      resolvedLocationText:
        'University of Science and Technology of Southern Philippines, Cagayan de Oro City',
      whereasClauses: [
        {
          id: 'seed-clause-1',
          name: 'Legal Basis',
          body: 'WHEREAS, Section 12 of the Revised IRR of R.A. 9184 provides that the BAC shall recommend to the Head of the Procuring Entity the use of Alternative Methods of Procurement as provided for in the Rules;',
        },
        {
          id: 'seed-clause-2',
          name: 'Requirement Review',
          body: 'WHEREAS, the BAC has reviewed the procurement requirement reflected in the selected BAC Resolution and has confirmed that the linked Consolidated PRs support the recommended mode of procurement;',
        },
      ],
      provisionalMembers: [
        {
          id: 'seed-end-user-rep',
          role: 'End-user Rep',
          name: 'End-user Representative Demo',
          position: 'End-user Representative',
        },
        {
          id: 'seed-tech-rep',
          role: 'Tech Rep',
          name: 'Technical Representative Demo',
          position: 'Technical Representative',
        },
      ],
      signatoryOverrides: undefined,
      status: seed.status,
      createdBy: 'Procurement Staff Demo',
      createdAt: SEED_TIMESTAMP,
      updatedAt: SEED_TIMESTAMP,
      totalAmount: linkedPr.amount,
      awardRecommendation: buildAwardRecommendation(seed, linkedPr, index),
      linkedConsolidatedPrs: [{ ...linkedPr }],
      activityLog: [
        {
          id: `log-seed-${index + 1}`,
          action:
            seed.status === 'draft'
              ? 'Created draft'
              : seed.status === 'for-approval'
                ? 'Submitted for approval'
                : seed.status === 'returned'
                  ? 'Returned for revision'
                  : 'Approved by HOPE',
          actor:
            seed.status === 'approved'
              ? 'Chairperson Demo'
              : seed.status === 'returned'
                ? 'BAC Chairperson Demo'
                : 'Procurement Staff Demo',
          timestamp: SEED_TIMESTAMP,
          note: seed.activityNote,
        },
      ],
      returnReason: seed.returnReason ?? null,
      approvedBy: seed.approvedBy ?? null,
      approvedAt: seed.approvedAt ?? null,
      signedDocumentFileName: seed.signedDocumentFileName ?? null,
      printFileName: seed.printFileName ?? null,
      workspaceOrigin: seed.workspaceOrigin ?? null,
    }
  })
}

let mockBacResolutionDatabase: Array<BacResolution> | null = null

export const getMockBacResolutionDatabase = (): Array<BacResolution> => {
  if (!mockBacResolutionDatabase) {
    mockBacResolutionDatabase = buildSeededDatabase()
  }

  return mockBacResolutionDatabase
}

export const resetMockBacResolutionDatabase = () => {
  mockBacResolutionDatabase = null
}

export const getMockConsolidatedPrs = () =>
  getMockConsolidatedPrDatabase().map((item) => ({ ...item }))

export const cloneResolution = (resolution: BacResolution): BacResolution => ({
  ...resolution,
  awardRecommendation: resolution.awardRecommendation
    ? { ...resolution.awardRecommendation }
    : null,
  linkedConsolidatedPrs: resolution.linkedConsolidatedPrs.map((item) => ({
    ...item,
  })),
  activityLog: resolution.activityLog.map((entry) => ({ ...entry })),
  whereasClauses: resolution.whereasClauses.map((clause) => ({ ...clause })),
  provisionalMembers: resolution.provisionalMembers.map((member) => ({
    ...member,
  })),
  signatoryOverrides: resolution.signatoryOverrides
    ? { ...resolution.signatoryOverrides }
    : undefined,
})

export const findMockConsolidatedPrById = (id: string) =>
  getMockConsolidatedPrDatabase().find(
    (item) => item.id === id || item.prNumber === id,
  )

export const getMockBacResolutionById = (id: string) =>
  getMockBacResolutionDatabase().find((resolution) => resolution.id === id)

export const getBacResolutionIdFromFinalUrl = (finalUrl: string) => {
  const pathname = new URL(finalUrl, 'http://localhost').pathname
  const segments = pathname.split('/').filter(Boolean)
  const bacResolutionIndex = segments.indexOf('bac-resolutions')

  if (bacResolutionIndex < 0 || !segments[bacResolutionIndex + 1]) {
    throw new Error('BAC Resolution id is missing from the request URL.')
  }

  return segments[bacResolutionIndex + 1]
}
