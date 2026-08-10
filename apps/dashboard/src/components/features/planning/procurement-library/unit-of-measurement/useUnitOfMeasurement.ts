import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'
import { getUOMsRequest } from './handlers/getUOMsRequest'
import { getUOMRequest } from './handlers/getUOMRequest'
import { createUOMRequest } from './handlers/createUOMRequest'
import { updateUOMRequest } from './handlers/updateUOMRequest'
import { deleteUOMRequest } from './handlers/deleteUOMRequest'

/**
 * Hook for fetching all Units of Measurement
 *
 * Usage:
 * const { data, isLoading } = useUOMs({
 *   pathParams: {},
 *   queryParams: {}
 * })
 */
export const useUOMs = createQueryHookFromTemplate(getUOMsRequest)

/**
 * Hook for fetching a single Unit of Measurement by ID
 *
 * Usage:
 * const { data, isLoading } = useUOMById({
 *   pathParams: { id: 'uom-id' },
 *   queryParams: {}
 * })
 */
export const useUOMById = createQueryHookFromTemplate(getUOMRequest)

/**
 * Hook for creating a new Unit of Measurement
 *
 * Usage:
 * const { mutate, isPending } = useCreateUOM()
 * mutate({
 *   pathParams: {},
 *   payload: { name: 'Kilogram', code: 'kg', conversionFactor: 1, parentId: null }
 * })
 */
export const useCreateUOM = createMutationHookFromTemplate(createUOMRequest)

/**
 * Hook for updating a Unit of Measurement
 *
 * Usage:
 * const { mutate, isPending } = useUpdateUOM()
 * mutate({
 *   pathParams: { id: 'uom-id' },
 *   payload: { name: 'Kilogram', code: 'kg', conversionFactor: 1, parentId: null }
 * })
 */
export const useUpdateUOM = createMutationHookFromTemplate(updateUOMRequest)

/**
 * Hook for deleting a Unit of Measurement
 *
 * Usage:
 * const { mutate, isPending } = useDeleteUOM()
 * mutate({
 *   pathParams: { id: 'uom-id' }
 * })
 */
export const useDeleteUOM = createMutationHookFromTemplate(deleteUOMRequest)
