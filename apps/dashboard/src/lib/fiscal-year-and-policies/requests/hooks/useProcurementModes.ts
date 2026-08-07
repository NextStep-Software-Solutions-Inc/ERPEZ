import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib';
import { getProcurementModesRequest } from '../getProcurementModesRequest';
import { getProcurementModeByIdRequest } from '../getProcurementModeByIdRequest';
import { createProcurementModeRequest } from '../createProcurementModeRequest';
import { updateProcurementModeRequest } from '../updateProcurementModeRequest';
import { archiveProcurementModeRequest } from '../archiveProcurementModeRequest';
import { unarchiveProcurementModeRequest } from '../unarchiveProcurementModeRequest';

/**
 * Hook for fetching paginated list of procurement modes
 *
 * Usage:
 * const { data, isLoading } = useProcurementModes({
 *   pathParams: {},
 *   queryParams: { pageNumber: 1, pageSize: 10 }
 * })
 */
export const useProcurementModes = createQueryHookFromTemplate(
  getProcurementModesRequest,
);

/**
 * Hook for fetching a single procurement mode by ID
 *
 * Usage:
 * const { data, isLoading } = useProcurementModeById({
 *   pathParams: { id: 'mode-id' }
 * })
 */
export const useProcurementModeById = createQueryHookFromTemplate(
  getProcurementModeByIdRequest,
);

/**
 * Hook for creating a new procurement mode
 *
 * Usage:
 * const { mutate, isPending } = useCreateProcurementMode();
 * mutate({
 *   name: 'Mode Name',
 *   description: 'Description',
 *   procurementCategoryId: 'category-id'
 * })
 *
 * Note: Cache invalidation for /procurement-modes is handled in the component
 */
export const useCreateProcurementMode = createMutationHookFromTemplate(
  createProcurementModeRequest,
);

/**
 * Hook for updating a procurement mode
 *
 * Usage:
 * const { mutate, isPending } = useUpdateProcurementMode();
 * mutate({
 *   pathParams: { id: 'mode-id' },
 *   payload: {
 *     name: 'Updated Name',
 *     isActive: true
 *   }
 * })
 *
 * Note: Cache invalidation for /procurement-modes is handled in the component
 */
export const useUpdateProcurementMode = createMutationHookFromTemplate(
  updateProcurementModeRequest,
);

/**
 * Hook for archiving a procurement mode
 *
 * Usage:
 * const { mutate, isPending } = useArchiveProcurementMode();
 * mutate({ pathParams: { id: 'mode-id' } })
 *
 * Note: Cache invalidation for /procurement-modes is handled in the component
 */
export const useArchiveProcurementMode = createMutationHookFromTemplate(
  archiveProcurementModeRequest,
);

/**
 * Hook for unarchiving a procurement mode
 *
 * Usage:
 * const { mutate, isPending } = useUnarchiveProcurementMode();
 * mutate({ pathParams: { id: 'mode-id' } })
 *
 * Note: Cache invalidation for /procurement-modes is handled in the component
 */
export const useUnarchiveProcurementMode = createMutationHookFromTemplate(
  unarchiveProcurementModeRequest,
);
