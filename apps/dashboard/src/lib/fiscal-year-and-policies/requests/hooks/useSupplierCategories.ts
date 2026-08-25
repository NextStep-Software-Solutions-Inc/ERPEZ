import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'
import { getSupplierCategoriesRequest } from '../getSupplierCategoriesRequest'
import { getSupplierCategoryRequest } from '../getSupplierCategoryRequest'
import { createSupplierCategoryRequest } from '../createSupplierCategoryRequest'
import { updateSupplierCategoryRequest } from '../updateSupplierCategoryRequest'
import { deleteSupplierCategoryRequest } from '../deleteSupplierCategoryRequest'

/**
 * Hook for fetching all supplier categories
 *
 * Usage:
 * const { data, isLoading, error } = useSupplierCategories({
 *   pathParams: {},
 *   queryParams: { pageNumber: 1, pageSize: 100 }
 * })
 *
 * Returns a paginated list of SupplierCategory objects:
 * - id: string (UUID)
 * - name: string
 * - description: string | null
 * - createdAt: string (ISO date-time)
 * - updatedAt: string | null (ISO date-time)
 */
export const useSupplierCategories = createQueryHookFromTemplate(
  getSupplierCategoriesRequest,
)

/**
 * Hook for fetching a single supplier category by ID
 *
 * Usage:
 * const { data, isLoading } = useSupplierCategoryById({
 *   pathParams: { id: 'category-id' },
 *   queryParams: {}
 * })
 */
export const useSupplierCategoryById = createQueryHookFromTemplate(
  getSupplierCategoryRequest,
)

/**
 * Hook for creating a new supplier category
 *
 * Usage:
 * const { mutate, isPending } = useCreateSupplierCategory();
 * mutate({
 *   pathParams: {},
 *   payload: { name: 'Supplier Category Name', description: 'Description' }
 * })
 */
export const useCreateSupplierCategory = createMutationHookFromTemplate(
  createSupplierCategoryRequest,
)

/**
 * Hook for updating a supplier category
 *
 * Usage:
 * const { mutate, isPending } = useUpdateSupplierCategory();
 * mutate({
 *   pathParams: { id: 'category-id' },
 *   payload: { name: 'Updated Name', description: 'Updated Description' }
 * })
 */
export const useUpdateSupplierCategory = createMutationHookFromTemplate(
  updateSupplierCategoryRequest,
)

/**
 * Hook for deleting a supplier category
 *
 * Usage:
 * const { mutate, isPending } = useDeleteSupplierCategory();
 * mutate({
 *   pathParams: { id: 'category-id' }
 * })
 */
export const useDeleteSupplierCategory = createMutationHookFromTemplate(
  deleteSupplierCategoryRequest,
)
