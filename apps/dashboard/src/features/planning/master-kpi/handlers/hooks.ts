import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getKpiByIdRequest } from './getKpiByIdRequest'
import { getKpisRequest } from './getKpisRequest'
import { getKpiTargetsRequest } from './getKpiTargetsRequest'

export const useKpiById = createQueryHookFromTemplate(getKpiByIdRequest)
export const useKpis = createQueryHookFromTemplate(getKpisRequest)
export const useKpiTargets = createQueryHookFromTemplate(getKpiTargetsRequest)
