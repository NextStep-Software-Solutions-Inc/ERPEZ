import type { ConsolidatedPR } from '../store/consolidatedPRStore'

const CANONICAL_CPR_ID_BY_SOURCE_PR_ID: Partial<Record<string, string>> = {
  'PR-004': 'CPR-2026-M04',
  'PR-005': 'CPR-2026-M05',
  'PR-006': 'CPR-2026-M06',
  'PR-007': 'CPR-2026-M07',
  'PR-008': 'CPR-2026-M08',
  'PR-009': 'CPR-2026-M09',
  'PR-010': 'CPR-2026-M10',
  'PR-011': 'CPR-2026-M11',
}

// Intentional migration seed overrides for legacy CPR records that need
// canonical data during hydration.
const CANONICAL_CPR_OVERRIDES: Partial<
  Record<string, Omit<ConsolidatedPR, 'id' | 'prNumber'>>
> = {
  'PR-008': {
    date: '2026-03-12',
    description: 'Air conditioning units',
    purpose: 'Facilities cooling upgrade',
    status: 'APPROVED/FOR BAC UTILIZATION',
    selectedPRItems: [
      {
        id: 'PR-008-Split Type Aircon 2.0HP-unit',
        prId: 'PR-008',
        prNumber: 'PR-2026-008',
        prOffice: 'Facilities Management Office',
        itemName: 'Split Type Aircon 2.0HP',
        unit: 'unit',
        qty: 4,
        unitPrice: 32000,
        totalAmount: 128000,
        category: 'HVAC',
        prType: 'non-cse',
        month: '2026-04',
        fund: 'Facilities Fund',
      },
    ],
    itemMOPs: {
      'PR-008-Split Type Aircon 2.0HP-unit': {
        mop: 'svp',
        allowPartial: true,
      },
    },
  },
  'PR-011': {
    date: '2026-05-06',
    description: 'Training materials and printed resources',
    purpose: 'Standalone consolidated PR for direct acquisition drill-through',
    status: 'APPROVED/FOR BAC UTILIZATION',
    selectedPRItems: [
      {
        id: 'PR-011-Training Workbook 100pp-pc',
        prId: 'PR-011',
        prNumber: 'PR-2026-011',
        prOffice: 'HR Department',
        itemName: 'Training Workbook (printed, 100pp)',
        unit: 'pc',
        qty: 50,
        unitPrice: 350,
        totalAmount: 17500,
        category: 'Training Materials',
        prType: 'non-cse',
        month: '2026-05',
        fund: 'HRD Fund',
      },
      {
        id: 'PR-011-Presentation Folder Set-set',
        prId: 'PR-011',
        prNumber: 'PR-2026-011',
        prOffice: 'HR Department',
        itemName: 'Presentation folder set',
        unit: 'set',
        qty: 50,
        unitPrice: 270,
        totalAmount: 13500,
        category: 'Training Materials',
        prType: 'non-cse',
        month: '2026-05',
        fund: 'HRD Fund',
      },
    ],
    itemMOPs: {
      'PR-011-Training Workbook 100pp-pc': {
        mop: 'svp',
        allowPartial: true,
      },
      'PR-011-Presentation Folder Set-set': {
        mop: 'svp',
        allowPartial: true,
      },
    },
  },
}

function normalizeModeOfProcurement(mop?: string) {
  if (mop === 'infrastructure' || mop === 'competitive-bidding') {
    return 'public-bidding'
  }

  return mop
}

function cloneItemMOPs(itemMOPs?: ConsolidatedPR['itemMOPs']) {
  if (!itemMOPs) {
    return itemMOPs
  }

  return Object.fromEntries(
    Object.entries(itemMOPs).map(([key, value]) => [
      key,
      {
        ...value,
        mop: normalizeModeOfProcurement(value.mop),
      },
    ]),
  )
}

function cloneCanonicalOverride(
  override: Omit<ConsolidatedPR, 'id' | 'prNumber'>,
) {
  return {
    ...override,
    selectedPRItems: override.selectedPRItems.map((item) => ({ ...item })),
    itemMOPs: cloneItemMOPs(override.itemMOPs),
  }
}

export function normalizePersistedConsolidatedPr(
  pr: ConsolidatedPR,
): ConsolidatedPR {
  const normalizedId = pr.id.replace(/^PR-2026-M/, 'CPR-2026-M')
  const normalizedPrNumber = pr.prNumber?.replace(/^PR-2026-M/, 'CPR-2026-M')
  const sourcePrId = pr.selectedPRItems[0]?.prId
  const canonicalId =
    (sourcePrId && CANONICAL_CPR_ID_BY_SOURCE_PR_ID[sourcePrId]) ??
    normalizedPrNumber ??
    normalizedId
  const itemMOPs = cloneItemMOPs(pr.itemMOPs)

  const normalized: ConsolidatedPR = {
    ...pr,
    id: canonicalId,
    prNumber: canonicalId,
    selectedPRItems: pr.selectedPRItems.map((item) => ({ ...item })),
    itemMOPs,
  }

  const canonicalOverride =
    sourcePrId && CANONICAL_CPR_OVERRIDES[sourcePrId]
      ? cloneCanonicalOverride(CANONICAL_CPR_OVERRIDES[sourcePrId])
      : null

  return canonicalOverride
    ? {
        ...normalized,
        ...canonicalOverride,
        id: canonicalId,
        prNumber: canonicalId,
      }
    : normalized
}
