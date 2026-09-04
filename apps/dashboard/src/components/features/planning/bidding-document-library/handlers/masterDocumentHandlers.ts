import type {
  APIResponse,
  MutationBlueprintFromTemplate,
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { MasterDocumentTypeDto } from '../types/api'

const getEndpoint = '/admin/bidding-documents'
const itemEndpoint = '/admin/bidding-documents/:id'

export const getMasterDocumentsRequest: QueryBlueprintFromTemplate<
  typeof getEndpoint,
  PaginationResponse<MasterDocumentTypeDto>,
  QueryParams,
  QueryKey
> = {
  endpoint: getEndpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<MasterDocumentTypeDto>>(
      finalUrl,
      { signal }
    )
    return response.data
  },
}

export type CreateMasterDocumentPayload = {
  name: string
  description?: string
  envelopeType: number
  fileId?: string
}

export const createMasterDocumentRequest: MutationBlueprintFromTemplate<
  typeof getEndpoint,
  APIResponse<string>, // returns Guid
  undefined,
  CreateMasterDocumentPayload
> = {
  endpoint: getEndpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<string>>(finalUrl, payload)
    return response.data
  },
}

export type UpdateMasterDocumentPayload = {
  name: string
  description?: string
  envelopeType: number
  fileId?: string
}

export const updateMasterDocumentRequest: MutationBlueprintFromTemplate<
  typeof itemEndpoint,
  APIResponse<void>,
  undefined,
  UpdateMasterDocumentPayload
> = {
  endpoint: itemEndpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<void>>(
      finalUrl,
      payload
    )
    return response.data
  },
}

export const deleteMasterDocumentRequest: MutationBlueprintFromTemplate<
  typeof itemEndpoint,
  void,
  undefined,
  undefined
> = {
  endpoint: itemEndpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<void>(finalUrl)
    return response.data
  },
}
