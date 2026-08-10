import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'
import { getOPCRsRequest } from './getOPCRsRequest'
import { getOPCRRequest } from './getOPCRRequest'
import { createOPCRRequest } from './createOPCRRequest'
import { updateOPCRRequest } from './updateOPCRRequest'
import { deleteOPCRRequest } from './deleteOPCRRequest'
import { updateOPCRStatusRequest } from './updateOPCRStatusRequest'
import { submitOPCRRatingRequest } from './submitOPCRRatingRequest'
import { returnOPCRRatingRequest } from './returnOPCRRatingRequest'
import { getOPCRItemsRequest } from './getOPCRItemsRequest'

/**
 * Hook for fetching paginated list of OPCRs
 *
 * Usage:
 * const { data, isLoading } = useOPCRs({
 *   pathParams: {},
 *   queryParams: { pageNumber: 1, pageSize: 10 }
 * })
 */
export const useOPCRs = createQueryHookFromTemplate(getOPCRsRequest)

/**
 * Hook for fetching OPCR items
 *
 * Usage:
 * const { data, isLoading } = useGetOPCRItemsQuery()
 */
export const useGetOPCRItemsQuery = createQueryHookFromTemplate(getOPCRItemsRequest)

/**
 * Hook for fetching a single OPCR by ID
 *
 * Usage:
 * const { data, isLoading } = useOPCR({
 *   pathParams: { id: 'opcr-id' }
 * })
 */
export const useOPCR = createQueryHookFromTemplate(getOPCRRequest)

/**
 * Hook for creating a new OPCR
 *
 * Usage:
 * const { mutate, isPending } = useCreateOPCR();
 * mutate({
 *   officeId: 'office-id',
 *   fiscalYearId: 'fiscal-year-id',
 *   name: 'OPCR Name',
 *   code: 'OPCR-001'
 * })
 *
 * Note: Cache invalidation for /opcrs is handled in the component
 */
export const useCreateOPCR = createMutationHookFromTemplate(createOPCRRequest)

/**
 * Hook for updating an OPCR
 *
 * Usage:
 * const { mutate, isPending } = useUpdateOPCR();
 * mutate({
 *   pathParams: { id: 'opcr-id' },
 *   payload: {
 *     name: 'Updated Name',
 *     code: 'OPCR-002'
 *   }
 * })
 *
 * Note: Cache invalidation for /opcrs is handled in the component
 */
export const useUpdateOPCR = createMutationHookFromTemplate(updateOPCRRequest)

/**
 * Hook for deleting an OPCR
 *
 * Usage:
 * const { mutate, isPending } = useDeleteOPCR();
 * mutate({ pathParams: { id: 'opcr-id' } })
 *
 * Note: Cache invalidation for /opcrs is handled in the component
 */
export const useDeleteOPCR = createMutationHookFromTemplate(deleteOPCRRequest)

/**
 * Hook for updating OPCR status
 *
 * Usage:
 * const { mutate, isPending } = useUpdateOPCRStatus();
 * mutate({
 *   pathParams: { id: 'opcr-id' },
 *   payload: { status: 'Submitted' }
 * })
 *
 * Note: Cache invalidation for /opcrs is handled in the component
 */
export const useUpdateOPCRStatus = createMutationHookFromTemplate(
  updateOPCRStatusRequest,
)

/**
 * Hook for submitting OPCR rating
 *
 * Usage:
 * const { mutate, isPending } = useSubmitOPCRRating();
 * mutate({ pathParams: { id: 'opcr-id' } })
 *
 * Note: Cache invalidation for /opcrs is handled in the component
 */
export const useSubmitOPCRRating = createMutationHookFromTemplate(
  submitOPCRRatingRequest,
)

/**
 * Hook for returning OPCR rating
 *
 * Usage:
 * const { mutate, isPending } = useReturnOPCRRating();
 * mutate({ pathParams: { id: 'opcr-id' } })
 *
 * Note: Cache invalidation for /opcrs is handled in the component
 */
export const useReturnOPCRRating = createMutationHookFromTemplate(
  returnOPCRRatingRequest,
)
