import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getCalendarEventsRequest } from './getCalendarEventsRequest'
import { getCalendarEventsSummaryRequest } from './getCalendarEventsSummaryRequest'
import { getCalendarEventByIdRequest } from './getCalendarEventByIdRequest'

export const useCalendarEvents = createQueryHookFromTemplate(
  getCalendarEventsRequest,
)

export const useCalendarEventsSummary = createQueryHookFromTemplate(
  getCalendarEventsSummaryRequest,
)

export const useCalendarEventById = createQueryHookFromTemplate(
  getCalendarEventByIdRequest,
)
