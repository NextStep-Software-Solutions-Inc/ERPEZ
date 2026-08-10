import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
} from 'erpez-shared-lib'
import { getLIBSummaryRequest } from '../handlers/getLIBSummaryRequest'
import { linkCeilingToLIBRequest } from '../handlers/linkCeilingToLIBRequest'
import { getLIBHistoryRequest } from '../handlers/getLIBHistoryRequest'

export const useLIBSummary = createQueryHookFromTemplate(
  getLIBSummaryRequest,
)

export const useLinkCeiling = createMutationHookFromTemplate(
  linkCeilingToLIBRequest,
)

export const useLIBHistory = createQueryHookFromTemplate(
  getLIBHistoryRequest,
)
