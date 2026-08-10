import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'
import { getProcurementCategoriesRequest } from '../getProcurementCategoriesRequest'
import { getProcurementCategoryRequest } from '../getProcurementCategoryRequest'
import { createProcurementCategoryRequest } from '../createProcurementCategoryRequest'
import { updateProcurementCategoryRequest } from '../updateProcurementCategoryRequest'
import { deleteProcurementCategoryRequest } from '../deleteProcurementCategoryRequest'

/**
 * Hook for fetching all procurement categories
 *
 * Usage:
 * const { data, isLoading, error } = useProcurementCategories({
 *   pathParams: {},
 *   queryParams: {}
 * })
 *
 * Returns a paginated list of ProcurementCategory objects:
 * - id: string (UUID)
 * - name: string
 * - description: string | null
 * - createdAt: string (ISO date-time)
 * - updatedAt: string (ISO date-time)
 */
export const useProcurementCategories = createQueryHookFromTemplate(
  getProcurementCategoriesRequest,
)

/**
 * Hook for fetching a single procurement category by ID
 *
 * Usage:
 * const { data, isLoading } = useProcurementCategoryById({
 *   pathParams: { id: 'category-id' },
 *   queryParams: {}
 * })
 */
export const useProcurementCategoryById = createQueryHookFromTemplate(
  getProcurementCategoryRequest,
)

/**
 * Hook for creating a new procurement category
 *
 * Usage:
 * const { mutate, isPending } = useCreateProcurementCategory();
 * mutate({
 *   pathParams: {},
 *   payload: { name: 'Category Name', description: 'Description' }
 * })
 */
export const useCreateProcurementCategory = createMutationHookFromTemplate(
  createProcurementCategoryRequest,
)

/**
 * Hook for updating a procurement category
 *
 * Usage:
 * const { mutate, isPending } = useUpdateProcurementCategory();
 * mutate({
 *   pathParams: { id: 'category-id' },
 *   payload: { name: 'Updated Name', description: 'Updated Description' }
 * })
 */
export const useUpdateProcurementCategory = createMutationHookFromTemplate(
  updateProcurementCategoryRequest,
)

/**
 * Hook for deleting a procurement category
 *
 * Usage:
 * const { mutate, isPending } = useDeleteProcurementCategory();
 * mutate({
 *   pathParams: { id: 'category-id' }
 * })
 */
export const useDeleteProcurementCategory = createMutationHookFromTemplate(
  deleteProcurementCategoryRequest,
)
