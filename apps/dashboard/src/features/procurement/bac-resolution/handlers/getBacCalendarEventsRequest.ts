import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type {
  ApiResponse,
  CalendarEventsWithSummary,
  GetCalendarEventsParams,
} from '../../bidding-schedule/types'
import api from '@/services/api'

const endpoint = '/bac/calendar-events'

export const getBacCalendarEventsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  ApiResponse<CalendarEventsWithSummary>,
  GetCalendarEventsParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<ApiResponse<CalendarEventsWithSummary>>(
      finalUrl,
      { signal },
    )
    return response.data
  },
}
