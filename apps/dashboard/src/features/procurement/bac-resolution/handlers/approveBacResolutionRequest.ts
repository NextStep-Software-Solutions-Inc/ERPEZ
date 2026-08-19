import { USE_MOCK_BAC_RESOLUTIONS } from '../config'
import {
  cloneResolution,
  getMockBacResolutionDatabase,
} from '../data/mockBacResolutionData'
import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { ApproveBacResolutionPayload, BacResolution } from '../types'
import api from '@/services/api'

const endpoint = '/bac-resolutions/:id/approve'

export const approveBacResolutionRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  BacResolution,
  undefined,
  ApproveBacResolutionPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) {
      throw new Error('Approve BAC Resolution payload is required.')
    }

    if (USE_MOCK_BAC_RESOLUTIONS) {
      const db = getMockBacResolutionDatabase()
      const resolution = db.find((item) => item.id === payload.bacResolutionId)
      if (!resolution) {
        throw new Error('BAC Resolution not found.')
      }
      if (!resolution.linkedConsolidatedPrs || resolution.linkedConsolidatedPrs.length === 0) {
        throw new Error('Link exactly one approved Consolidated PR before approving.')
      }
      resolution.status = 'approved'
      resolution.approvedBy = 'BAC Chairperson Demo'
      resolution.approvedAt = new Date().toISOString()
      resolution.activityLog.unshift({
        id: `log-${Date.now()}`,
        action: 'Approved BAC Resolution',
        actor: 'BAC Chairperson Demo',
        timestamp: new Date().toISOString(),
        note: 'Physically signed PDF uploaded and approved.',
      })
      return cloneResolution(resolution)
    }

    // 1. Upload the signed PDF file in the background
    const formData = new FormData()
    formData.append('file', payload.signedDocument)

    const uploadResponse = await api.post<{ succeeded: boolean; data: string }>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    const attachmentFileId = uploadResponse.data?.data
    if (!attachmentFileId) {
      throw new Error('Failed to upload signed BAC Resolution document.')
    }

    // 2. Call the approved endpoint using the uploaded file ID
    await api.patch(`/bac/projects/${payload.bacResolutionId}/approve`, {
      attachmentFileId,
    })

    // Fetch the updated details to return the correct object to the react-query mutation
    const projectResponse = await api.get<{ succeeded: boolean; data: any }>(`/bac/projects/${payload.bacResolutionId}`)
    const project = projectResponse.data?.data

    if (!project) {
      throw new Error('BAC Resolution not found on server.')
    }

    const resolution = project.bacResolutions?.[0]
    const statusLower = (project.status || 'draft').toLowerCase()
    let frontendStatus: BacResolution['status'] = 'draft'
    if (statusLower === 'submit' || statusLower === 'submitted' || statusLower === 'for-approval') {
      frontendStatus = 'for-approval'
    } else if (statusLower === 'decline' || statusLower === 'returned') {
      frontendStatus = 'returned'
    } else if (statusLower === 'approve' || statusLower === 'approved') {
      frontendStatus = 'approved'
    }

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
      status: frontendStatus,
      createdBy: 'System',
      createdAt: project.createdAt || new Date().toISOString(),
      updatedAt: project.updatedAt || new Date().toISOString(),
      totalAmount: project.abc || 0,
      linkedConsolidatedPrs: project.consolidatedPRId ? [{
        id: project.consolidatedPRId,
        prNumber: 'PR-' + project.consolidatedPRId.substring(0, 8),
        description: project.title || '',
        endUser: 'N/A',
        projectName: project.title || '',
        amount: project.abc || 0,
        modeOfProcurement: project.modeOfProcurementName || 'N/A',
        status: 'approved' as const
      }] : [],
      activityLog: [],
    } as BacResolution
  },
}
