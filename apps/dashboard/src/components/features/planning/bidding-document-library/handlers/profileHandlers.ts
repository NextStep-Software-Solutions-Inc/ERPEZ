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

const listEndpoint = '/admin/bidding-documents/profiles'
const itemEndpoint = '/admin/bidding-documents/profiles/:profileId'

export const getProfilesRequest: QueryBlueprintFromTemplate<
  typeof listEndpoint,
  PaginationResponse<DocumentProfileDto>,
  QueryParams,
  QueryKey
> = {
  endpoint: listEndpoint,
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
  typeof listEndpoint,
  APIResponse<string>,
  undefined,
  CreateProfilePayload
> = {
  endpoint: listEndpoint,
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
  typeof itemEndpoint,
  APIResponse<void>,
  undefined,
  UpdateProfilePayload
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

export const deleteProfileRequest: MutationBlueprintFromTemplate<
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

export const getProfileByIdRequest: QueryBlueprintFromTemplate<
  typeof itemEndpoint,
  APIResponse<DocumentProfileDto>,
  undefined,
  QueryKey
> = {
  endpoint: itemEndpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<DocumentProfileDto>>(finalUrl, { signal })
    return response.data
  },
}
