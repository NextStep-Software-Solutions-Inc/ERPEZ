import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type {
  ApiResponse,
  CalendarSummary,
  GetCalendarEventsParams,
} from '../../bidding-schedule/types'
import api from '@/services/api'

const endpoint = '/bac/calendar-events/summary'

export const getCalendarEventsSummaryRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  ApiResponse<CalendarSummary>,
  GetCalendarEventsParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<ApiResponse<CalendarSummary>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
