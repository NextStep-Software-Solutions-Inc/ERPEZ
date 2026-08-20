/**
 * APR Handlers — Barrel Export
 * Central export point for all APR request handlers and hooks
 */

export { getAPRsRequest, type GetAPRsParams } from './getAPRsRequest'
export { getAPRRequest, type GetAPRParams } from './getAPRRequest'
export { createAPRRequest } from './createAPRRequest'
export { submitAPRRequest } from './submitAPRRequest'
export { returnAPRRequest } from './returnAPRRequest'
export { approveAPRRequest } from './approveAPRRequest'
export { deleteAPRRequest, type DeleteAPRPayload } from './deleteAPRRequest'
export { updateAPRRequest } from './updateAPRRequest'
export { addItemsToAPRRequest } from './addItemsToAPRRequest'
export { getAdminAPRsRequest } from './getAdminAPRsRequest'
export { getApprovedAPPsRequest, type BackendAPPResponse, type APPItemResponse } from './getApprovedAPPsRequest'
export { getAPPByIdRequest, type GetAPPByIdParams } from './getAPPByIdRequest'
export { getFiscalYearsRequest, type FiscalYearDto, type FiscalYearsResponse } from './getFiscalYearsRequest'
export { getAllocatedAPPItemIdsRequest, type GetAllocatedAPPItemIdsParams } from './getAllocatedAPPItemIdsRequest'

// React Query and Mutation Hooks
export {
  useAPRs,
  useAPR,
  useApprovedAPPs,
  useAPPById,
  useFiscalYears,
  useAllocatedAPPItemIds,
  useCreateAPRMutation,
  useSubmitAPRMutation,
  useApproveAPRMutation,
  useReturnAPRMutation,
  useDeleteAPRMutation,
  useUpdateAPRMutation,
  useAddCatalogItemsToAPRMutation,
  useRemoveAPRItemMutation,
} from './hooks'
