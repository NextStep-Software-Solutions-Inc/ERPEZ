import type { QueryBlueprintFromTemplate, QueryKey, PaginationResponse, QueryParams } from 'erpez-shared-lib';
import type { ProcurementModeThreshold } from '../types';
import api from '@/services/api';

const endpoint = '/procurement-mode-thresholds';

export const getProcurementModeThresholdsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  PaginationResponse<ProcurementModeThreshold>,
  QueryParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<PaginationResponse<ProcurementModeThreshold>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
