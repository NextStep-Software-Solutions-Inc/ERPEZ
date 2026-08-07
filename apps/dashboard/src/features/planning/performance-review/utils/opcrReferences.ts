import type { OPCRItem, OPCRListItem } from '@/lib/opcr'
import type { OPCRReference } from '../types'

function mapOpcrStatus(
  status: string | null | undefined,
): OPCRReference['status'] {
  const normalized = (status?.trim().toUpperCase()) ?? ''
  return normalized.includes('DRAFT') ? 'DRAFT' : 'APPROVED'
}

/**
 * Derive self-rating / finalization progress directly from the
 * opcrItemRatings embedded in each OPCRItem.
 *
 * - selfRatingDone  → at least one item has a non-null selfRating
 * - finalizationDone → at least one item has a non-null pmtRating
 *
 * This avoids relying on the `ratingStatus` field which the backend
 * does not currently return.
 */
function computeRatingProgress(items: OPCRItem[]) {
  let selfRatingDone = false
  let finalizationDone = false

  for (const item of items) {
    if (!item.opcrItemRatings?.length) continue

    for (const r of item.opcrItemRatings) {
      if (r.selfRating != null) selfRatingDone = true
      if (r.pmtRating != null) finalizationDone = true
    }

    if (selfRatingDone && finalizationDone) break
  }

  return { selfRatingDone, finalizationDone }
}

function getItemOpcrKey(item: OPCRItem) {
  if (item.opcrId) return item.opcrId

  const officeKey = item.officeId ?? item.officeName ?? 'opcr-items'
  const fiscalYear = getItemFiscalYear(item) || 'all-years'
  return `${officeKey}-${fiscalYear}`
}

function getItemFiscalYear(item: OPCRItem) {
  return item.fiscalYear === null || item.fiscalYear === undefined
    ? ''
    : String(item.fiscalYear)
}

function buildItemReference(opcrId: string, items: OPCRItem[]): OPCRReference {
  const firstItem = items[0]
  const fiscalYear = firstItem ? getItemFiscalYear(firstItem) : ''
  const deliveryUnitId = firstItem?.officeId ?? opcrId
  const deliveryUnitName = firstItem?.officeName?.trim() || 'Unassigned Office'
  const progress = computeRatingProgress(items)

  return {
    id: opcrId,
    title: `OPCR ${fiscalYear || 'Unspecified FY'} - ${deliveryUnitName}`,
    fiscalYear,
    deliveryUnitId,
    deliveryUnitName,
    status: 'APPROVED',
    kpiCount: items.length,
    ...progress,
  }
}

function normalizeText(value: string | number | null | undefined) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

export function opcrItemMatchesReference(item: OPCRItem, opcr: OPCRReference) {
  if (item.opcrId && item.opcrId === opcr.id) return true

  const itemFiscalYear = getItemFiscalYear(item)
  const sameFiscalYear =
    !itemFiscalYear || !opcr.fiscalYear || itemFiscalYear === opcr.fiscalYear
  const sameOfficeId = !!item.officeId && item.officeId === opcr.deliveryUnitId
  const sameOfficeName =
    normalizeText(item.officeName) !== '' &&
    normalizeText(item.officeName) === normalizeText(opcr.deliveryUnitName)

  return sameFiscalYear && (sameOfficeId || sameOfficeName)
}

export function buildOPCRReferencesFromApi(
  opcrs: OPCRListItem[],
  items: OPCRItem[],
): OPCRReference[] {
  const itemsByOpcrId = items.reduce((groups, item) => {
    const opcrId = getItemOpcrKey(item)
    const group = groups.get(opcrId) ?? []
    group.push(item)
    groups.set(opcrId, group)
    return groups
  }, new Map<string, OPCRItem[]>())

  if (opcrs.length === 0) {
    return Array.from(itemsByOpcrId.entries()).map(([opcrId, group]) =>
      buildItemReference(opcrId, group),
    )
  }

  return opcrs.map((opcr) => {
    const fiscalYear =
      opcr.fiscalYear === null || opcr.fiscalYear === undefined
        ? ''
        : String(opcr.fiscalYear)
    const referenceBase: OPCRReference = {
      id: opcr.id,
      title: opcr.name?.trim() || '',
      fiscalYear,
      deliveryUnitId: opcr.officeId,
      deliveryUnitName: opcr.officeName?.trim() || 'Unassigned Office',
      status: mapOpcrStatus(opcr.status),
      kpiCount: 0,
    }
    const groupedItems =
      itemsByOpcrId.get(opcr.id) ??
      items.filter((item) => opcrItemMatchesReference(item, referenceBase))
    const deliveryUnitName =
      opcr.officeName?.trim() ||
      groupedItems[0]?.officeName?.trim() ||
      'Unassigned Office'
    const kpiCount =
      groupedItems.length || opcr.kpiAssignmentCount || opcr.activityCount

    // Derive progress from actual selfRating / pmtRating data in items
    const progress = computeRatingProgress(groupedItems)

    return {
      id: opcr.id,
      title:
        opcr.name?.trim() ||
        `OPCR ${fiscalYear || 'Unspecified FY'} - ${deliveryUnitName}`,
      fiscalYear,
      deliveryUnitId: opcr.officeId,
      deliveryUnitName,
      status: mapOpcrStatus(opcr.status),
      kpiCount,
      commitmentStatus: opcr.commitmentStatus,
      reviewStatus: opcr.reviewStatus,
      ...progress,
    }
  })
}

export function getOpcrIdForItem(item: OPCRItem) {
  return getItemOpcrKey(item)
}
