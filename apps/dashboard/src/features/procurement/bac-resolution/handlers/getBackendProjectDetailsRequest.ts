import type { QueryBlueprintFromTemplate } from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/bac/projects/:id' as const

export interface BiddingActivitySchedule {
  id: string
  procurementProjectId: string
  procurementActivityTypeId: string
  procurementActivityTypeName: string
  startDate: string
  endDate: string
  venue: string
  status: string
  remarks: string
}

export interface BackendProjectDetails {
  id: string
  title: string
  consolidatedPRId: string | null
  modeOfProcurementName: string | null
  abc: number
  status: string
  bacResolutions: {
    id: string
    procurementProjectId: string
    resolutionType: string
    resolutionNumber: string
    dateResolved: string
    status: string
    whereasClause: string
  }[]
  biddingActivitySchedules: BiddingActivitySchedule[]
}

export interface BackendProjectDetailsResponse {
  succeeded: boolean
  message?: string | null
  data?: BackendProjectDetails | null
  errors?: any
}

export const getBackendProjectDetailsRequest = {
  endpoint,
  key: ({ url }) => ['bac-project-details', url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<BackendProjectDetailsResponse>(finalUrl, { signal })
    const details = response.data?.data

    if (!details) {
      throw new Error('Project details not found.')
    }

    return details
  },
}
