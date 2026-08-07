import {
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import { LineItemBudgetDetails } from '../types/types'

const endpoint = '/line-item-budget-details'

export const getLineItemBudgetDetailsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<LineItemBudgetDetails>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<LineItemBudgetDetails>>(
      finalUrl,
      {
        signal,
      },
    )
    return response.data
  },
}
