import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
} from 'erpez-shared-lib'
import { createSupplierRequest } from './handlers/createSupplierRequest'
import { deleteSupplierRequest } from './handlers/deleteSupplierRequest'
import { getSupplierCategoriesRequest } from './handlers/getSupplierCategoriesRequest'
import { getSupplierRequest } from './handlers/getSupplierRequest'
import { getSuppliersRequest } from './handlers/getSuppliersRequest'
import { updateSupplierStatusRequest } from './handlers/updateSupplierStatusRequest'
import { updateSupplierRequest } from './handlers/updateSupplierRequest'

export const useSuppliers = createQueryHookFromTemplate(getSuppliersRequest)
export const useSupplierById = createQueryHookFromTemplate(getSupplierRequest)
export const useSupplierCategories = createQueryHookFromTemplate(
  getSupplierCategoriesRequest,
)
export const useCreateSupplier = createMutationHookFromTemplate(
  createSupplierRequest,
)
export const useUpdateSupplier = createMutationHookFromTemplate(
  updateSupplierRequest,
)
export const useUpdateSupplierStatus = createMutationHookFromTemplate(
  updateSupplierStatusRequest,
)
export const useDeleteSupplier = createMutationHookFromTemplate(
  deleteSupplierRequest,
)
