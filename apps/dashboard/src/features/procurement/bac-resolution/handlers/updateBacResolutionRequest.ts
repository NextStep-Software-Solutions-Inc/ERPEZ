import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { BacResolution, CreateBacResolutionPayload } from '../types'
import api from '@/services/api'
import type { BackendProjectResponse } from './createBacResolutionRequest'

const endpoint = '/bac/projects/:id'

export const updateBacResolutionRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  BacResolution,
  undefined,
  CreateBacResolutionPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) {
      throw new Error('BAC Resolution payload is required.')
    }

    const whereasClauseText = (payload.whereasClauses || [])
      .map((c) => c.body)
      .join('\n\n')

    const apiPayload = {
      title: payload.title || payload.description || 'Untitled Project',
      abc: typeof payload.abc === 'number' ? payload.abc : 0,
      status: 'Draft',
      resolutionType: payload.resolutionType || 'Standard',
      resolutionNumber: payload.bacResolutionNumber,
      whereasClause: whereasClauseText,
      endUserRepresentativeId: payload.endUserRepresentativeId || null,
      techRepresentativeId: payload.techRepresentativeId || null,
    }

    const response = await api.put<{ succeeded: boolean; data: BackendProjectResponse }>(finalUrl, apiPayload)
    const backendData = response.data?.data

    if (!backendData) {
      throw new Error('No data returned from backend.')
    }

    const mappedResolution: BacResolution = {
      id: backendData.id || '',
      bacResolutionNumber: backendData.bacResolutions?.[0]?.resolutionNumber || payload.bacResolutionNumber,
      resolutionDate: backendData.bacResolutions?.[0]?.dateResolved || payload.resolutionDate || new Date().toISOString(),
      description: payload.description || backendData.title || '',
      resolvedDateText: payload.resolvedDateText || new Date(payload.resolutionDate).toLocaleDateString('en-PH', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
      }),
      resolvedLocationText: payload.resolvedLocationText || 'University of Science and Technology of Southern Philippines, Cagayan de Oro City',
      whereasClauses: payload.whereasClauses || [],
      provisionalMembers: payload.provisionalMembers || [],
      signatoryOverrides: payload.signatoryOverrides,
      status: 'draft',
      createdBy: 'Procurement Staff',
      createdAt: backendData.createdAt || new Date().toISOString(),
      updatedAt: backendData.updatedAt || new Date().toISOString(),
      totalAmount: backendData.abc || payload.abc || 0,
      linkedConsolidatedPrs: [],
      activityLog: [],
      workspaceOrigin: payload.workspaceOrigin ?? null,
    }

    return mappedResolution
  },
}
