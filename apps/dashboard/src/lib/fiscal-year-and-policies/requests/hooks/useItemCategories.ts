import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib';
import { getItemCategoriesRequest } from '../getItemCategoriesRequest';
import { createItemCategoryRequest } from '../createItemCategoryRequest';
import { updateItemCategoryRequest } from '../updateItemCategoryRequest';
import { deleteItemCategoryRequest } from '../deleteItemCategoryRequest';

/**
 * Hook for fetching paginated list of item categories
 *
 * Usage:
 * const { data, isLoading } = useItemCategories({
 *   pathParams: {},
 *   queryParams: { pageNumber: 1, pageSize: 10 }
 * })
 */
export const useItemCategories = createQueryHookFromTemplate(
  getItemCategoriesRequest,
);

/**
 * Hook for creating a new item category
 *
 * Usage:
 * const { mutate, isPending } = useCreateItemCategory();
 * mutate({
 *   pathParams: {},
 *   payload: {
 *     name: 'IT Equipment',
 *     description: 'Laptops, desktops, and peripherals',
 *   }
 * })
 */
export const useCreateItemCategory = createMutationHookFromTemplate(
  createItemCategoryRequest,
);

/**
 * Hook for updating an existing item category
 *
 * Usage:
 * const { mutate, isPending } = useUpdateItemCategory();
 * mutate({
 *   pathParams: { id: 'category-id' },
 *   payload: {
 *     id: 'category-id',
 *     name: 'IT Equipment & Accessories',
 *   }
 * })
 */
export const useUpdateItemCategory = createMutationHookFromTemplate(
  updateItemCategoryRequest,
);

/**
 * Hook for deleting an item category
 *
 * Usage:
 * const { mutate, isPending } = useDeleteItemCategory();
 * mutate({
 *   pathParams: { id: 'category-id' },
 *   payload: undefined,
 * })
 */
export const useDeleteItemCategory = createMutationHookFromTemplate(
  deleteItemCategoryRequest,
);
