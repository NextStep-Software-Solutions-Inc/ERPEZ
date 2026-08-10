import type { MutationBlueprintFromTemplate, APIResponse, QueryParams } from 'erpez-shared-lib';
import type { UpdateOPCRStatusPayload, OPCRListItem } from '../types';
import api from '@/services/api';

const endpoint = '/opcrs/:id/status';

export const updateOPCRStatusRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OPCRListItem>,
  QueryParams,
  UpdateOPCRStatusPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<OPCRListItem>>(finalUrl, payload);
    return response.data;
  },
};
