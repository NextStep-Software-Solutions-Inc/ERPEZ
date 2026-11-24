import api from '@/services/api'
import type {
  BackendPublicProject,
  BackendStatsResponse,
  PublicPortalStats,
  SubmitApplicationPayload,
  ValidateApplicationPayload,
} from './types/portalTypes'

export const getPublicProjectsRequest = {
  fetcher: async (params?: { search?: string; mode?: string }): Promise<BackendPublicProject[]> => {
    const res = await api.get<{ succeeded: boolean; data: BackendPublicProject[] }>('/api/public/projects', {
      params,
    })
    return res.data?.data ?? []
  },
}

export const getPublicProjectDetailRequest = {
  fetcher: async (projectId: string): Promise<BackendPublicProject> => {
    const res = await api.get<{ succeeded: boolean; data: BackendPublicProject; message?: string }>(
      `/api/public/projects/${projectId}`
    )
    if (!res.data?.succeeded || !res.data?.data) {
      throw new Error(res.data?.message || 'Failed to load project details.')
    }
    return res.data.data
  },
}

export const getPublicPortalStatsRequest = {
  fetcher: async (): Promise<PublicPortalStats> => {
    const res = await api.get<{ succeeded: boolean; data: BackendStatsResponse }>('/api/public/projects/stats')
    const s = res.data?.data
    return {
      total: s?.activeProjects ?? 0,
      publicBidding: s?.publicBidding ?? 0,
      svp: s?.smallValueProcurement ?? 0,
      closingSoon: s?.closingSoon ?? 0,
      closed: s?.closed ?? 0,
    }
  },
}

export const validatePublicApplicationRequest = {
  fetcher: async ({
    projectId,
    payload,
  }: {
    projectId: string
    payload: ValidateApplicationPayload
  }): Promise<{ valid: boolean }> => {
    const res = await api.post<{ succeeded: boolean; message?: string }>(
      `/api/public/projects/${projectId}/validate-application`,
      payload
    )
    if (!res.data?.succeeded) {
      throw new Error(res.data?.message || 'Validation failed.')
    }
    return { valid: true }
  },
}

export const uploadPublicFileRequest = {
  fetcher: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post<{ succeeded: boolean; data: string }>('/files/public/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (response.data?.succeeded && response.data.data) {
        return response.data.data
      }
    } catch {
      const response = await api.post<{ succeeded: boolean; data: string }>('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (response.data?.succeeded && response.data.data) {
        return response.data.data
      }
    }

    throw new Error('File upload failed')
  },
}

export const submitPublicApplicationRequest = {
  fetcher: async ({
    projectId,
    payload,
  }: {
    projectId: string
    payload: SubmitApplicationPayload
  }): Promise<{ referenceNumber: string }> => {
    const response = await api.post<{ succeeded: boolean; data: string; message?: string }>(
      `/api/public/projects/${projectId}/apply`,
      payload
    )
    if (!response.data?.succeeded || !response.data?.data) {
      throw new Error(response.data?.message || 'Submission failed.')
    }
    return { referenceNumber: response.data.data }
  },
}
