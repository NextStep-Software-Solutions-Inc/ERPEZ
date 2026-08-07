import type {
  QueryBlueprintFromTemplate,
  QueryKey,
  APIResponse,
} from 'erpez-shared-lib';
import type { ProcurementMode } from '../procurement-threshold.types';
import api from '@/services/api';

const endpoint = '/procurement-modes/:id';

export const getProcurementModeByIdRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ProcurementMode>,
  { pathParams: { id: string } },
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url],
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<ProcurementMode>>(finalUrl, {
      signal,
    });
    return response.data;
  },
};
