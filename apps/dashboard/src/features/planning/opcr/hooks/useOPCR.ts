import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'
import { getOPCRsRequest } from '../handlers/getOPCRsRequest'
// import { getOPCRRequest } from '../handlers/getOPCRRequest'
import { createOPCRRequest } from '../handlers/createOPCRRequest'
import { updateOPCRRequest } from '../handlers/updateOPCRRequest'
import { deleteOPCRRequest } from '../handlers/deleteOpcrRequest'
import { submitOPCRRequest } from '../handlers/submitOPCRRequest'
import { submitOPCRRatingRequest } from '../handlers/submitOPCRRatingRequest'
import { returnOPCRRatingRequest } from '../handlers/returnOPCRRatingRequest'
import { getOPCRRequest } from '../handlers/getOPCRRequest'
import { generateOPCRDocumentRequest } from '../handlers/generateOPCRDocumentRequest'

/**
 * Hook for fetching a list of OPCRs
 *
 * Usage:
 * const { data, isLoading } = useOPCRs({ pathParams: {}, queryParams: {} })
 */
export const useOPCRs = createQueryHookFromTemplate(getOPCRsRequest)

/**
 * Hook for fetching a single OPCR by ID
 *
 * Usage:
 * const { data, isLoading } = useOPCRById({ pathParams: { id: 'opcr-id' } })
 */
export const useOPCRById = createQueryHookFromTemplate(getOPCRRequest)

/**
 * Hook for creating a new OPCR
 *
 * Usage:
 * const { mutate, isPending } = useCreateOPCR()
 * mutate({ officeId: 'office-id', fiscalYearId: 'fy-id' })
 */
export const useCreateOPCR = createMutationHookFromTemplate(createOPCRRequest)

/**
 * Hook for updating an existing OPCR
 *
 * Usage:
 * const { mutate, isPending } = useUpdateOPCR()
 * mutate({ pathParams: { id: 'opcr-id' }, payload: { name: 'New Name' } })
 */
export const useUpdateOPCR = createMutationHookFromTemplate(updateOPCRRequest)

/**
 * Hook for deleting an OPCR
 *
 * Usage:
 * const { mutate, isPending } = useDeleteOPCR()
 * mutate({ pathParams: { id: 'opcr-id' } })
 */
export const useDeleteOPCR = createMutationHookFromTemplate(deleteOPCRRequest)

/**
 * Hook for updating the status of an OPCR (PUT /opcrs/:id/status)
 *
 * Usage:
 * const { mutate, isPending } = useUpdateOPCRStatus()
 * mutate({ pathParams: { id: 'opcr-id' }, payload: { status: 'Submitted' } })
 */
export const useUpdateOPCRStatus =
  createMutationHookFromTemplate(submitOPCRRequest)

/**
 * Hook for submitting an OPCR rating (POST /opcrs/:id/rating/submit)
 *
 * Usage:
 * const { mutate, isPending } = useSubmitOPCRRating()
 * mutate({ pathParams: { id: 'opcr-id' }, payload: { comments: 'Good work' } })
 */
export const useSubmitOPCRRating = createMutationHookFromTemplate(
  submitOPCRRatingRequest,
)

export const useReturnOPCRRating = createMutationHookFromTemplate(
  returnOPCRRatingRequest,
)

/**
 * Hook for generating an OPCR PDF document (POST /api/planning/documents/opcr/:opcrId/generate)
 *
 * Usage:
 * const { mutateAsync, isPending } = useGenerateOPCRDocument()
 * const res = await mutateAsync({ pathParams: { opcrId: 'opcr-id' } })
 */
export const useGenerateOPCRDocument = createMutationHookFromTemplate(
  generateOPCRDocumentRequest,
)


