import type { PaginationResponse, QueryBlueprintFromTemplate, QueryKey, QueryParams } from 'erpez-shared-lib'
import api from '@/services/api'

export interface ProcurementItem {
  id: string
  name: string
  specifications?: string
  type: string
  isCSE: boolean
  itemLife: number
  productCode?: string
  imageURL?: string
  isActive: boolean
  objectCodeId: string
  objectCodeName: string
  unspscCodeId: string
  unspscCodeName: string
  uomId: string
  uomName: string
  createdAt: string
  updatedAt?: string | null
}

const endpoint = '/procurement-items'

export const getProcurementItemsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<ProcurementItem>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<ProcurementItem>>(finalUrl, { signal })
    return response.data
  },
}
