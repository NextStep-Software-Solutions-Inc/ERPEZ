import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
} from 'erpez-shared-lib'
import { createLIBAmendmentRequest } from '../handlers/createLIBAmendmentRequest'
import { getLIBAmendmentsRequest } from '../handlers/getLIBAmendmentsRequest'
import { getLIBAmendmentRequest } from '../handlers/getLIBAmendmentRequest'
import { updateLIBAmendmentRequest } from '../handlers/updateLIBAmendmentRequest'
import { deleteLIBAmendmentRequest } from '../handlers/deleteLIBAmendmentRequest'
import { submitLIBAmendmentRequest } from '../handlers/submitLIBAmendmentRequest'
import { approveLIBAmendmentRequest } from '../handlers/approveLIBAmendmentRequest'
import { returnLIBAmendmentRequest } from '../handlers/returnLIBAmendmentRequest'

export const useLIBAmendments = createQueryHookFromTemplate(
  getLIBAmendmentsRequest,
)
export const useLIBAmendmentDetails = createQueryHookFromTemplate(
  getLIBAmendmentRequest,
)
export const useCreateLIBAmendment = createMutationHookFromTemplate(
  createLIBAmendmentRequest,
)
export const useUpdateLIBAmendment = createMutationHookFromTemplate(
  updateLIBAmendmentRequest,
)
export const useDeleteLIBAmendment = createMutationHookFromTemplate(
  deleteLIBAmendmentRequest,
)
export const useSubmitLIBAmendment = createMutationHookFromTemplate(
  submitLIBAmendmentRequest,
)
export const useApproveLIBAmendment = createMutationHookFromTemplate(
  approveLIBAmendmentRequest,
)
export const useReturnLIBAmendment = createMutationHookFromTemplate(
  returnLIBAmendmentRequest,
)

