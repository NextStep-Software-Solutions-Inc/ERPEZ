import { buildEndpoint } from 'erpez-shared-lib'
import type {
  APIResponse,
  MutationBlueprintFromTemplate,
  QueryBlueprintFromTemplate,
} from 'erpez-shared-lib'
import type { ProjectChecklistResponse } from '../types/api'
import api from '@/services/api'

export const getProjectChecklistRequest: QueryBlueprintFromTemplate<
  '/bac/projects/:projectId/checklists',
  APIResponse<ProjectChecklistResponse>
> = {
  endpoint: '/bac/projects/:projectId/checklists',
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<ProjectChecklistResponse>>(
      finalUrl,
      { signal }
    )
    return response.data
  },
}

export const getProjectChecklistQueryKey = (projectId: string) => {
  const finalUrl = buildEndpoint(getProjectChecklistRequest.endpoint, { projectId }, undefined)
  return getProjectChecklistRequest.key({
    url: finalUrl,
    pathParams: { projectId },
    queryParams: undefined,
  })
}

export type LoadProfilePayload = {
  documentProfileId: string
}

export const loadProfileRequest: MutationBlueprintFromTemplate<
  '/bac/projects/:projectId/checklists/load-profile',
  APIResponse<void>,
  undefined,
  LoadProfilePayload
> = {
  endpoint: '/bac/projects/:projectId/checklists/load-profile',
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<void>>(
      finalUrl,
      payload
    )
    return response.data
  },
}

export type AddCustomRequirementPayload = {
  customDocumentName: string
  envelopeType: 1 | 2
  orderIndex: number
  fileId?: string
}

export const addCustomRequirementRequest: MutationBlueprintFromTemplate<
  '/bac/projects/:projectId/checklists/custom',
  APIResponse<string>,
  undefined,
  AddCustomRequirementPayload
> = {
  endpoint: '/bac/projects/:projectId/checklists/custom',
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<string>>(
      finalUrl,
      payload
    )
    return response.data
  },
}

export type UpdateChecklistItemPayload = {
  isRequired: boolean
  orderIndex: number
}

export const updateChecklistItemRequest: MutationBlueprintFromTemplate<
  '/bac/projects/:projectId/checklists/:checklistItemId',
  APIResponse<void>,
  undefined,
  UpdateChecklistItemPayload
> = {
  endpoint: '/bac/projects/:projectId/checklists/:checklistItemId',
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<void>>(
      finalUrl,
      payload
    )
    return response.data
  },
}

export const deleteChecklistItemRequest: MutationBlueprintFromTemplate<
  '/bac/projects/:projectId/checklists/:checklistItemId',
  void
> = {
  endpoint: '/bac/projects/:projectId/checklists/:checklistItemId',
  fetcher: async ({ finalUrl }) => {
    const response = await api.delete<void>(
      finalUrl
    )
    return response.data
  },
}

export const confirmChecklistRequest: MutationBlueprintFromTemplate<
  '/bac/projects/:projectId/checklists/confirm',
  APIResponse<void>
> = {
  endpoint: '/bac/projects/:projectId/checklists/confirm',
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<void>>(
      finalUrl
    )
    return response.data
  },
}

export const resetChecklistRequest: MutationBlueprintFromTemplate<
  '/bac/projects/:projectId/checklists/reset',
  APIResponse<void>
> = {
  endpoint: '/bac/projects/:projectId/checklists/reset',
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<void>>(
      finalUrl
    )
    return response.data
  },
} 