import type {
  APIResponse,
  MutationBlueprintFromTemplate,
  PaginationResponse,
  QueryBlueprintFromTemplate,
  QueryKey,
  QueryParams,
} from 'erpez-shared-lib'
import api from '@/services/api'
import type { DocumentProfileDto } from '../types/api'

export const getProfilesRequest: QueryBlueprintFromTemplate<
  '/admin/bidding-documents/profiles',
  PaginationResponse<DocumentProfileDto>,
  QueryParams,
  QueryKey
> = {
  endpoint: '/admin/bidding-documents/profiles',
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<DocumentProfileDto>>(
      finalUrl,
      { signal }
    )
    return response.data
  },
}

export type CreateProfilePayload = {
  name: string
  description?: string
  procurementCategory: string
  items: { masterDocumentTypeId: string; orderIndex: number }[]
}

export const createProfileRequest: MutationBlueprintFromTemplate<
  '/admin/bidding-documents/profiles',
  APIResponse<string>,
  undefined,
  CreateProfilePayload
> = {
  endpoint: '/admin/bidding-documents/profiles',
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<string>>(finalUrl, payload)
    return response.data
  },
}

export type UpdateProfilePayload = {
  name: string
  description?: string
  procurementCategory: string
  items: { masterDocumentTypeId: string; orderIndex: number }[]
}

export const updateProfileRequest: MutationBlueprintFromTemplate<
  '/admin/bidding-documents/profiles/:profileId',
  APIResponse<void>,
  undefined,
  UpdateProfilePayload
> = {
  endpoint: '/admin/bidding-documents/profiles/:profileId',
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<void>>(
      finalUrl,
      payload
    )
    return response.data
  },
}

export const deleteProfileRequest: MutationBlueprintFromTemplate<
  '/admin/bidding-documents/profiles/:profileId',
  void
> = {
  endpoint: '/admin/bidding-documents/profiles/:profileId',
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<void>(finalUrl)
    return response.data
  },
}

export const getProfileByIdRequest: QueryBlueprintFromTemplate<
  '/admin/bidding-documents/profiles/:profileId',
  APIResponse<DocumentProfileDto>
> = {
  endpoint: '/admin/bidding-documents/profiles/:profileId',
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<DocumentProfileDto>>(finalUrl, { signal })
    return response.data
  },
}
