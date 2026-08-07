/**
 * Update Office Assignment Mutation Handler
 * 
 * Updates an existing office assignment
 * Pattern: Follows erpez-shared-lib MutationBlueprintFromTemplate
 */

import type { MutationBlueprintFromTemplate, APIResponse } from 'erpez-shared-lib'
import api from '@/services/api'
import type { OfficeAssignment } from '../types'

const endpoint = '/office-assignments/:id'

type UpdateOfficeAssignmentPayload = Partial<OfficeAssignment>

export const updateOfficeAssignmentRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OfficeAssignment>,
  undefined,
  UpdateOfficeAssignmentPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<OfficeAssignment>>(
      finalUrl,
      payload,
    )
    return response.data
  },
}
