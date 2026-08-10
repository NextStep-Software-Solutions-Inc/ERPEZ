import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
} from 'erpez-shared-lib'
import { createRatingScaleTemplateRequest } from './handlers/createRatingScaleTemplateRequest'
import { deleteRatingScaleTemplateRequest } from './handlers/deleteRatingScaleTemplateRequest'
import { getRatingScaleTemplateRequest } from './handlers/getRatingScaleTemplateRequest'
import { getRatingScaleTemplatesRequest } from './handlers/getRatingScaleTemplatesRequest'
import { updateRatingScaleTemplateRequest } from './handlers/updateRatingScaleTemplateRequest'

export const useRatingScaleTemplates = createQueryHookFromTemplate(
  getRatingScaleTemplatesRequest,
)
export const useRatingScaleTemplateById = createQueryHookFromTemplate(
  getRatingScaleTemplateRequest,
)
export const useCreateRatingScaleTemplate = createMutationHookFromTemplate(
  createRatingScaleTemplateRequest,
)
export const useUpdateRatingScaleTemplate = createMutationHookFromTemplate(
  updateRatingScaleTemplateRequest,
)
export const useDeleteRatingScaleTemplate = createMutationHookFromTemplate(
  deleteRatingScaleTemplateRequest,
)
