import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'
import { getGeneralRatingScalesRequest } from './getGeneralRatingScalesRequest'
import { getGeneralRatingScaleRequest } from './getGeneralRatingScaleRequest'
import { createGeneralRatingScaleRequest } from './createGeneralRatingScaleRequest'
import { updateGeneralRatingScaleRequest } from './updateGeneralRatingScaleRequest'
import { deleteGeneralRatingScaleRequest } from './deleteGeneralRatingScaleRequest'

/**
 * Hook for fetching paginated list of general rating scales
 *
 * Usage:
 * const { data, isLoading } = useGeneralRatingScales({
 *   pathParams: {},
 *   queryParams: { pageNumber: 1, pageSize: 10, sorts: 'year' }
 * })
 */
export const useGeneralRatingScales = createQueryHookFromTemplate(
  getGeneralRatingScalesRequest,
)

/**
 * Hook for fetching a single general rating scale by ID
 *
 * Usage:
 * const { data, isLoading } = useGeneralRatingScaleById({
 *   pathParams: { id: 'scale-id' }
 * })
 */
export const useGeneralRatingScaleById = createQueryHookFromTemplate(
  getGeneralRatingScaleRequest,
)

/**
 * Hook for creating a new general rating scale
 *
 * Usage:
 * const { mutate, isPending } = useCreateGeneralRatingScale();
 * mutate({
 *   fiscalYearId: 'year-id',
 *   adjectivalRatingName: 'Excellent',
 *   minScore: 4.5,
 *   maxScore: 5.0
 * })
 */
export const useCreateGeneralRatingScale = createMutationHookFromTemplate(
  createGeneralRatingScaleRequest,
)

/**
 * Hook for updating an existing general rating scale
 *
 * Usage:
 * const { mutate, isPending } = useUpdateGeneralRatingScale();
 * mutate({
 *   pathParams: { id: 'scale-id' },
 *   payload: {
 *     adjectivalRatingName: 'Updated Name',
 *     minScore: 4.0,
 *     maxScore: 4.5
 *   }
 * })
 */
export const useUpdateGeneralRatingScale = createMutationHookFromTemplate(
  updateGeneralRatingScaleRequest,
)

/**
 * Hook for deleting a general rating scale
 *
 * Usage:
 * const { mutate, isPending } = useDeleteGeneralRatingScale();
 * mutate({
 *   pathParams: { id: 'scale-id' }
 * })
 */
export const useDeleteGeneralRatingScale = createMutationHookFromTemplate(
  deleteGeneralRatingScaleRequest,
)
