import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getLIBsRequest } from '../../line-item-budget/handlers/getLIBsRequest'
import { getLIBRequest } from '../../line-item-budget/handlers/getLIBRequest'
import { getLIBActivitiesRequest } from '../../line-item-budget/handlers/getLIBActivitiesRequest'
import { getWFPRequest } from '@/components/features/planning/wfp/wfp/handlers/getWFPRequest'
import { getOPCRRequest } from '@/features/planning/opcr/handlers/getOPCRRequest'

export const useLIBs = createQueryHookFromTemplate(getLIBsRequest)
export const useLIB = createQueryHookFromTemplate(getLIBRequest)
export const useLIBActivities = createQueryHookFromTemplate(getLIBActivitiesRequest)
export const useWFP = createQueryHookFromTemplate(getWFPRequest)
export const useOPCR = createQueryHookFromTemplate(getOPCRRequest)
