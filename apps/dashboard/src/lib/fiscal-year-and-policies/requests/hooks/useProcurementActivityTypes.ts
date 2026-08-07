import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'
import { getProcurementActivityTypesRequest } from '../getProcurementActivityTypesRequest'
import { getProcurementActivityTypeRequest } from '../getProcurementActivityTypeRequest'
import { createProcurementActivityTypeRequest } from '../createProcurementActivityTypeRequest'
import { updateProcurementActivityTypeRequest } from '../updateProcurementActivityTypeRequest'
import { deleteProcurementActivityTypeRequest } from '../deleteProcurementActivityTypeRequest'

/**
 * Hook for fetching all procurement activity types
 *
 * Usage:
 * const { data, isLoading, error } = useProcurementActivityTypes({
 *   pathParams: {},
 *   queryParams: {}
 * })
 *
 * Returns an array of ProcurementActivityType objects:
 * - id: string (UUID)
 * - name: string | null
 * - description: string | null
 * - minDays: number | null (int32)
 * - maxDays: number | null (int32)
 * - isActive: boolean
 * - createdAt: string (ISO date-time)
 * - updatedAt: string (ISO date-time) | null
 */
export const useProcurementActivityTypes = createQueryHookFromTemplate(
  getProcurementActivityTypesRequest,
)

/**
 * Hook for fetching a single procurement activity type by ID
 * 
 * @note Reserved for future use - not currently implemented in the UI
 *
 * Usage:
 * const { data, isLoading } = useProcurementActivityTypeById({
 *   pathParams: { id: 'activity-type-id' },
 *   queryParams: {}
 * })
 */
export const useProcurementActivityTypeById = createQueryHookFromTemplate(
  getProcurementActivityTypeRequest,
)

/**
 * Hook for creating a new procurement activity type
 *
 * Usage:
 * const { mutate, isPending } = useCreateProcurementActivityType();
 * mutate({
 *   pathParams: {},
 *   payload: {
 *     name: 'Activity Name',
 *     description: 'Activity Description',
 *     minDays: 3,
 *     maxDays: 7
 *   }
 * })
 */
export const useCreateProcurementActivityType = createMutationHookFromTemplate(
  createProcurementActivityTypeRequest,
)

/**
 * Hook for updating a procurement activity type
 *
 * Usage:
 * const { mutate, isPending } = useUpdateProcurementActivityType();
 * mutate({
 *   pathParams: { id: 'activity-type-id' },
 *   payload: {
 *     name: 'Updated Name',
 *     description: 'Updated Description',
 *     minDays: 5,
 *     maxDays: 10,
 *     isActive: true
 *   }
 * })
 */
export const useUpdateProcurementActivityType = createMutationHookFromTemplate(
  updateProcurementActivityTypeRequest,
)

/**
 * Hook for deleting a procurement activity type
 *
 * Usage:
 * const { mutate, isPending } = useDeleteProcurementActivityType();
 * mutate({
 *   pathParams: { id: 'activity-type-id' }
 * })
 */
export const useDeleteProcurementActivityType = createMutationHookFromTemplate(
  deleteProcurementActivityTypeRequest,
)
