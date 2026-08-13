import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { BacResolution, CreateBacResolutionPayload } from '../types'
import api from '@/services/api'

const endpoint = '/bac/projects'

export interface BackendProjectResponse {
  id: string
  title: string
  consolidatedPRId?: string | null
  modeOfProcurementName?: string | null
  abc: number
  status: string
  createdAt?: string
  updatedAt?: string
  bacResolutions?: {
    id: string
    procurementProjectId: string
    resolutionType: string
    resolutionNumber: string
    dateResolved: string
    status: string
    whereasClause: string
  }[] | null
}

export const createBacResolutionRequest: MutationBlueprintFromTemplate<
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

    const templateClauseIds = (payload.whereasClauses || [])
      .filter((c) => c.id && c.id !== '')
      .map((c) => c.id!)

    const customClausesText = (payload.whereasClauses || [])
      .filter((c) => !c.id || c.id === '')
      .map((c) => c.body)

    const apiPayload = {
      title: payload.title || payload.description || undefined,
      abc: typeof payload.abc === 'number' ? payload.abc : undefined,
      sourceType: payload.sourceType,
      appItemId: payload.sourceType === 'AppItem' ? payload.appItemId : undefined,
      consolidatedPRId: payload.sourceType === 'ConsolidatedPR' ? payload.consolidatedPRId : undefined,
      resolutionType: payload.resolutionType || 'Standard',
      resolutionNumber: payload.bacResolutionNumber,
      dateResolved: payload.resolutionDate,
      resolvedLocation: payload.resolvedLocationText,
      selectedTemplateClauseIds: templateClauseIds,
      customClauses: customClausesText,
      endUserRepresentativeId: payload.endUserRepresentativeId || null,
      techRepresentativeId: payload.techRepresentativeId || null,
      userId: '00000000-0000-0000-0000-000000000000'
    }

    const response = await api.post<{ succeeded: boolean; data: BackendProjectResponse }>(finalUrl, apiPayload)
    const backendData = response.data?.data

    if (!backendData) {
      throw new Error('No data returned from backend.')
    }

    // Map backend project response back to frontend BacResolution structure
    const mappedResolution: BacResolution = {
      id: backendData.id || `bac-resolution-${Date.now()}`,
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
