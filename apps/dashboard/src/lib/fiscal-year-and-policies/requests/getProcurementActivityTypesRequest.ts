import type { QueryBlueprintFromTemplate, QueryKey, APIResponse, QueryParams } from 'erpez-shared-lib';
import type { ProcurementActivityType } from '../types/procurementActivityTypes';
import api from '@/services/api';

const endpoint = '/procurement-activity-types';

export const getProcurementActivityTypesRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ProcurementActivityType[]>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<ProcurementActivityType[]>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
