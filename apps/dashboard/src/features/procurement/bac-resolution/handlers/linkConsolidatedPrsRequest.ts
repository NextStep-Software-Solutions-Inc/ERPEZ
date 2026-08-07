import type { MutationBlueprintFromTemplate } from 'erpez-shared-lib'
import type { BacResolution } from '../types'
import type { LinkConsolidatedPrsPayload } from '../types'
import {
  cloneResolution,
  findMockConsolidatedPrById,
  getMockBacResolutionDatabase,
} from '../data/mockBacResolutionData'
import { findOwningBacResolution } from '../utils/bacResolutionWorkflow'
import api from '@/services/api'

const endpoint = '/bac/projects/:id/consolidated-pr'

export const linkConsolidatedPrsRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  BacResolution,
  undefined,
  LinkConsolidatedPrsPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    if (!payload) {
      throw new Error('Link Consolidated PR payload is required.')
    }

    try {
      const response = await api.post<{ succeeded: boolean; data: any }>(finalUrl, {
        consolidatedPRId: payload.consolidatedPRId,
      })

      if (response.data?.succeeded) {
        const projectResponse = await api.get<{ succeeded: boolean; data: any }>(`/bac/projects/${payload.bacResolutionId}`)
        const project = projectResponse.data?.data
        if (project) {
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
            linkedConsolidatedPrs: project.consolidatedPR ? [{
              id: project.consolidatedPR.id,
              prNumber: project.consolidatedPR.cprNumber || '',
              description: project.consolidatedPR.description || '',
              endUser: 'N/A',
              projectName: project.consolidatedPR.description || '',
              amount: project.abc || 0,
              modeOfProcurement: 'N/A',
              status: 'linked'
            }] : [],
            activityLog: [],
          } as BacResolution
        }
      }
    } catch (apiError) {
      console.warn('API error during linking consolidated PR, falling back to mock mapping:', apiError)
    }

    // Standard local fallback/mock logic
    const resolution = getMockBacResolutionDatabase().find(
      (item) => item.id === payload.bacResolutionId,
    )

    if (!resolution) {
      throw new Error('BAC Resolution not found.')
    }

    if (resolution.status === 'approved') {
      throw new Error('Approved BAC Resolutions cannot be edited.')
    }

    const selectedConsolidatedPr = findMockConsolidatedPrById(payload.consolidatedPRId)

    if (!selectedConsolidatedPr) {
      throw new Error('The selected Consolidated PR could not be found.')
    }

    const owningResolution = findOwningBacResolution(
      getMockBacResolutionDatabase(),
      selectedConsolidatedPr.id,
      resolution.id,
    )

    if (owningResolution) {
      throw new Error(
        `This Consolidated PR is already linked to ${owningResolution.bacResolutionNumber}. A Consolidated PR can only belong to one BAC Resolution.`,
      )
    }

    resolution.linkedConsolidatedPrs = [{ ...selectedConsolidatedPr }]
    resolution.totalAmount = selectedConsolidatedPr.amount
    resolution.updatedAt = new Date().toISOString()
    resolution.activityLog = [
      ...resolution.activityLog,
      {
        id: `log-${Date.now()}`,
        action: 'Linked Consolidated PR',
        actor: 'Procurement Staff Demo',
        timestamp: resolution.updatedAt,
        note: `${selectedConsolidatedPr.prNumber} linked as the owning Consolidated PR.`,
      },
    ]

    return cloneResolution(resolution)
  },
}
