import type { BiddingMasterCalendarEvent, ProcurementModeAbbr } from '../types'

export function getProcurementModeAbbreviation(
  event: Partial<BiddingMasterCalendarEvent> & {
    procurementMode?: string | null
  },
): ProcurementModeAbbr {
  const text = [
    event.procurementMode,
    event.primaryProjectName,
    event.milestoneName,
    event.milestoneKey,
    event.bacResolutionNumber,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (
    text.includes('direct contracting') ||
    text.includes('contracting') ||
    text.includes('mode: dc') ||
    text.includes(' dc ') ||
    text.endsWith(' dc')
  ) {
    return 'DC'
  }

  if (
    text.includes('direct acquisition') ||
    text.includes('acquisition') ||
    text.includes('mode: da') ||
    text.includes(' da ') ||
    text.endsWith(' da')
  ) {
    return 'DA'
  }

  if (
    text.includes('rfq') ||
    text.includes('quotation') ||
    text.includes('shopping') ||
    text.includes('small value') ||
    text.includes('svp')
  ) {
    return 'RFQ'
  }

  return 'PB'
}
