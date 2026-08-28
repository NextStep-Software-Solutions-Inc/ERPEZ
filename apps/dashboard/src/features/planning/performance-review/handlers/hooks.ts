import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'
import { getRatingScaleTemplateRequest } from './getRatingScaleTemplateRequest'
import { patchOPCRSelfEvaluateRequest } from './patchOPCRSelfEvaluateRequest'
import { patchOPCRReviewStatusRequest } from './patchOPCRReviewStatusRequest'

export const useRatingScaleTemplate = createQueryHookFromTemplate(
  getRatingScaleTemplateRequest,
)

export const usePatchOPCRSelfEvaluate = createMutationHookFromTemplate(
  patchOPCRSelfEvaluateRequest,
)

export const usePatchOPCRReviewStatus = createMutationHookFromTemplate(
  patchOPCRReviewStatusRequest,
)
