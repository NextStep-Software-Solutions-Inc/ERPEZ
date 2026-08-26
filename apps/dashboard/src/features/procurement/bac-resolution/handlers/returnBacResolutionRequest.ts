import type { APIResponse, MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { BacResolution, BacProjectDetails, ReturnBacResolutionPayload } from '../types'
import api from '@/services/api'

const endpoint = '/bac-resolutions/:id/return'

export const returnBacResolutionRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  BacResolution,
  undefined,
  ReturnBacResolutionPayload
> = {
  endpoint,
  fetcher: async ({ payload }) => {
    if (!payload) {
      throw new Error('Return BAC Resolution payload is required.')
    }

    // Call the live API
    await api.patch(`/bac/projects/${payload.bacResolutionId}/status`, {
      status: 'Returned',
    })

    // Fetch the updated details to return the correct object to the react-query mutation
    const projectResponse = await api.get<APIResponse<BacProjectDetails>>(`/bac/projects/${payload.bacResolutionId}`)
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
        modeOfProcurement: 'N/A',
        status: 'approved' as const
      }] : [],
      activityLog: [],
    } as BacResolution
  },
}
