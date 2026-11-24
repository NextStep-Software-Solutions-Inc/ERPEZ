import type { QueryBlueprintFromTemplate, QueryKey } from 'erpez-shared-lib'
import type {
  ApiResponse,
  CalendarEvent,
} from '../../bidding-schedule/types'
import api from '@/services/api'

const endpoint = '/bac/calendar-events/:id'

export const getCalendarEventByIdRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  ApiResponse<CalendarEvent>,
  { id: string },
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<ApiResponse<CalendarEvent>>(finalUrl, {
      signal,
    })
    return response.data
  },
}
