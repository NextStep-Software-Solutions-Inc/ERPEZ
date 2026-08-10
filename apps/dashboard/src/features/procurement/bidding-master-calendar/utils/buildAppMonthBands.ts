import { parseISO } from 'date-fns'
import { MASTER_CALENDAR_APP_TARGET_MONTHS } from '../data/mockBiddingMasterCalendarData'
import type { BacResolution } from '../../bac-resolution/types'
import { getPrimaryLinkedConsolidatedPr } from '../../bac-resolution/utils/bacResolutionWorkflow'
import type { BiddingMasterCalendarAppBand } from '../types'

export function buildAppMonthBands(
  resolutions: BacResolution[],
): BiddingMasterCalendarAppBand[] {
  return resolutions.map((resolution) => {
    const monthKey =
      MASTER_CALENDAR_APP_TARGET_MONTHS[resolution.id] ??
      resolution.resolutionDate.slice(0, 7)
    const primaryProjectName =
      getPrimaryLinkedConsolidatedPr(resolution)?.projectName ??
      resolution.description ??
      resolution.bacResolutionNumber

    return {
      id: `app-band-${resolution.id}`,
      label: `${primaryProjectName} APP target`,
      monthKey,
      bacResolutionId: resolution.id,
      fiscalYear: String(parseISO(resolution.resolutionDate).getFullYear()),
    }
  })
}
