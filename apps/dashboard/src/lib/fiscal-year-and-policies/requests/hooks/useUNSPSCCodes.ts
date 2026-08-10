import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'
import { getUNSPSCCodesRequest } from '../getUNSPSCCodesRequest'
import { getUNSPSCCodeRequest } from '../getUNSPSCCodeRequest'
import { createUNSPSCCodeRequest } from '../createUNSPSCCodeRequest'
import { updateUNSPSCCodeRequest } from '../updateUNSPSCCodeRequest'
import { deleteUNSPSCCodeRequest } from '../deleteUNSPSCCodeRequest'

/**
 * Hook for fetching all UNSPSC codes
 *
 * Usage:
 * const { data, isLoading, error } = useUNSPSCCodes({
 *   pathParams: {},
 *   queryParams: { pageNumber: 1, pageSize: 100 }
 * })
 *
 * Returns a paginated list of UNSPSCCode objects:
 * - id: string (UUID)
 * - code: string | null
 * - name: string | null
 * - description: string | null
 * - level: number (int32)
 * - isActive: boolean
 * - parentId: string | null (UUID)
 * - parentName: string | null
 * - createdAt: string (ISO date-time)
 * - updatedAt: string | null (ISO date-time)
 */
export const useUNSPSCCodes = createQueryHookFromTemplate(
  getUNSPSCCodesRequest,
)

/**
 * Hook for fetching a single UNSPSC code by ID
 *
 * Usage:
 * const { data, isLoading } = useUNSPSCCodeById({
 *   pathParams: { id: 'code-id' },
 *   queryParams: {}
 * })
 */
export const useUNSPSCCodeById = createQueryHookFromTemplate(
  getUNSPSCCodeRequest,
)

/**
 * Hook for creating a new UNSPSC code
 *
 * Usage:
 * const { mutate, isPending } = useCreateUNSPSCCode();
 * mutate({
 *   pathParams: {},
 *   payload: {
 *     code: '10000000',
 *     name: 'Live Plant and Animal Material',
 *     level: 1,
 *     parentId: null
 *   }
 * })
 *
 * Note: omit queryParams when the request does not define them; the mutation expects `payload`, not `body`.
 */
export const useCreateUNSPSCCode = createMutationHookFromTemplate(
  createUNSPSCCodeRequest,
)

/**
 * Hook for updating an existing UNSPSC code
 *
 * Usage:
 * const { mutate, isPending } = useUpdateUNSPSCCode();
 * mutate({
 *   pathParams: { id: 'code-id' },
 *   payload: {
 *     name: 'Updated Name',
 *     code: '10000001'
 *   }
 * })
 *
 * Note: omit queryParams when the request does not define them; the mutation expects `payload`, not `body`.
 */
export const useUpdateUNSPSCCode = createMutationHookFromTemplate(
  updateUNSPSCCodeRequest,
)

/**
 * Hook for deleting a UNSPSC code
 *
 * Usage:
 * const { mutate, isPending } = useDeleteUNSPSCCode();
 * mutate({
 *   pathParams: { id: 'code-id' },
 *   queryParams: {},
 * })
 */
export const useDeleteUNSPSCCode = createMutationHookFromTemplate(
  deleteUNSPSCCodeRequest,
)
