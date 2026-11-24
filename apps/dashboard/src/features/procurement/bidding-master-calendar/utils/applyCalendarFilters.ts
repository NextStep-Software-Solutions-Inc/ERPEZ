import type {
  BiddingMasterCalendarEvent,
  BiddingMasterCalendarFilters,
} from '../types'
import { getProcurementModeAbbreviation } from './modeUtils'

export function applyCalendarFilters(
  events: BiddingMasterCalendarEvent[],
  filters: BiddingMasterCalendarFilters,
): BiddingMasterCalendarEvent[] {
  const searchTerm = filters.searchTerm.trim().toLowerCase()

  return events.filter((event) => {
    if (
      searchTerm &&
      !event.bacResolutionNumber.toLowerCase().includes(searchTerm) &&
      !event.primaryProjectName.toLowerCase().includes(searchTerm) &&
      !event.projectNames.some((projectName) =>
        projectName.toLowerCase().includes(searchTerm),
      )
    ) {
      return false
    }

    if (
      filters.bacResolutionId &&
      event.bacResolutionId !== filters.bacResolutionId
    ) {
      return false
    }

    if (
      filters.milestoneKeys.length > 0 &&
      !filters.milestoneKeys.includes(event.milestoneKey)
    ) {
      return false
    }

    if (
      filters.procurementCategories.length > 0 &&
      !filters.procurementCategories.includes(event.procurementCategory)
    ) {
      return false
    }

    if (
      filters.offices.length > 0 &&
      !filters.offices.includes(event.officeLabel)
    ) {
      return false
    }

    if (
      filters.derivedStatuses.length > 0 &&
      !filters.derivedStatuses.includes(event.derivedProjectStatus)
    ) {
      return false
    }

    if (
      filters.fiscalYears.length > 0 &&
      !filters.fiscalYears.includes(event.fiscalYear)
    ) {
      return false
    }

    if (filters.dateRangeStart && event.eventDate < filters.dateRangeStart) {
      return false
    }

    if (filters.dateRangeEnd && event.eventDate > filters.dateRangeEnd) {
      return false
    }

    if (
      filters.procurementModes &&
      filters.procurementModes.length > 0
    ) {
      const mode = getProcurementModeAbbreviation(event)
      if (!filters.procurementModes.includes(mode)) {
        return false
      }
    }

    return true
  })
}
