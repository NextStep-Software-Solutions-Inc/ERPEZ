import { parseISO } from 'date-fns'
import { MASTER_CALENDAR_APP_TARGET_MONTHS } from '../data/mockBiddingMasterCalendarData'
import type { BacResolution } from '../../bac-resolution/types'
import type { BiddingMasterCalendarAppBand } from '../types'

export function buildAppMonthBands(
  resolutions: BacResolution[],
): BiddingMasterCalendarAppBand[] {
  return resolutions.map((resolution) => {
    const resDate = resolution.dateResolved || new Date().toISOString()
    const monthKey =
      MASTER_CALENDAR_APP_TARGET_MONTHS[resolution.id] ?? resDate.slice(0, 7)
    const primaryProjectName =
      resolution.resolutionNumber ?? resolution.id

    return {
      id: `app-band-${resolution.id}`,
      label: `${primaryProjectName} APP target`,
      monthKey,
      bacResolutionId: resolution.id,
      fiscalYear: String(parseISO(resDate).getFullYear()),
    }
  })
}
