import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getRatingScaleTemplatesRequest } from './getRatingScaleTemplatesRequest'
import { getRatingScaleTemplateRequest } from './getRatingScaleTemplateRequest'

export const useRatingScaleTemplates = createQueryHookFromTemplate(
  getRatingScaleTemplatesRequest,
)
export const useRatingScaleTemplate = createQueryHookFromTemplate(
  getRatingScaleTemplateRequest,
)
