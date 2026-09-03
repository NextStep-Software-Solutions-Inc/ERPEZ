import type {
  APIResponse,
  MutationBlueprintFromTemplate,
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import type { MasterDocumentTypeDto } from '../types/api'
import api from '@/services/api'

export const getMasterDocumentsRequest: QueryBlueprintFromTemplate<
  '/admin/bidding-documents',
  PaginationResponse<MasterDocumentTypeDto>,
  QueryParams,
  QueryKey
> = {
  endpoint: '/admin/bidding-documents',
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
  '/admin/bidding-documents',
  APIResponse<string>, // returns Guid
  undefined,
  CreateMasterDocumentPayload
> = {
  endpoint: '/admin/bidding-documents',
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
  removeFile?: boolean
}

export const updateMasterDocumentRequest: MutationBlueprintFromTemplate<
  '/admin/bidding-documents/:id',
  APIResponse<void>,
  undefined,
  UpdateMasterDocumentPayload
> = {
  endpoint: '/admin/bidding-documents/:id',
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<void>>(
      finalUrl,
      payload
    )
    return response.data
  },
}

export const deleteMasterDocumentRequest: MutationBlueprintFromTemplate<
  '/admin/bidding-documents/:id',
  void
> = {
  endpoint: '/admin/bidding-documents/:id',
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<void>(finalUrl)
    return response.data
  },
}
