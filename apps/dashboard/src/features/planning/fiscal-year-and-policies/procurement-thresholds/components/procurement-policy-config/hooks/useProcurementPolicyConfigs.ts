import { createQueryHookFromTemplate } from 'erpez-shared-lib';
import { getProcurementPolicyConfigsRequest } from '@/lib/fiscal-year-and-policies/requests/getProcurementPolicyConfigsRequest';
import type { QueryParams } from 'erpez-shared-lib';

export const useProcurementPolicyConfigs = createQueryHookFromTemplate(
  getProcurementPolicyConfigsRequest
);

export type UseProcurementPolicyConfigsParams = {
  pathParams: Record<string, unknown>;
  queryParams?: QueryParams & {
    pageSize?: number;
    pageNumber?: number;
    filters?: string;
  };
};
