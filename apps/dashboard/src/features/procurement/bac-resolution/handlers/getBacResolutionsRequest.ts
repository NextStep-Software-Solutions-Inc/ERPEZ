import type { QueryBlueprintFromTemplate } from 'erpez-shared-lib'
import type { BacResolutionListItem } from '../types'
import api from '@/services/api'
import type { BackendProjectResponse } from './createBacResolutionRequest'

const endpoint = '/bac/projects'

export interface BackendGetProjectsResponse {
  succeeded: boolean
  message?: string | null
  data?: BackendProjectResponse[] | null
  pageNumber?: number
  pageSize?: number
  totalPages?: number
  totalCount?: number
}

export const getBacResolutionsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  BacResolutionListItem[]
> = {
  endpoint,
  key: ({ url }) => ['bac-resolutions', url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<BackendGetProjectsResponse>(finalUrl, { signal })
    const list = response.data?.data || []

    return list.map((project) => {
      const resolution = project.bacResolutions?.[0]
      return {
        id: project.id,
        bacResolutionNumber: resolution?.resolutionNumber || 'N/A',
        resolutionDate: resolution?.dateResolved || project.createdAt || new Date().toISOString(),
        description: project.title || '',
        resolvedDateText: resolution?.dateResolved ? new Date(resolution.dateResolved).toLocaleDateString('en-PH', {
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
        }) : '',
        resolvedLocationText: '',
        whereasClauses: resolution?.whereasClause ? [{ name: 'WHEREAS Clause', body: resolution.whereasClause }] : [],
        provisionalMembers: [],
        status: (() => {
          const statusLower = (project.status || 'draft').toLowerCase()
          if (statusLower === 'submit' || statusLower === 'submitted' || statusLower === 'for-approval') {
            return 'for-approval' as const
          } else if (statusLower === 'decline' || statusLower === 'returned') {
            return 'returned' as const
          } else if (statusLower === 'approve' || statusLower === 'approved') {
            return 'approved' as const
          }
          return 'draft' as const
        })(),
        createdBy: 'System',
        createdAt: project.createdAt || new Date().toISOString(),
        updatedAt: project.updatedAt || new Date().toISOString(),
        totalAmount: project.abc || 0,
        linkedConsolidatedPrs: [],
        activityLog: [],
      } as BacResolutionListItem
    })
  },
}
