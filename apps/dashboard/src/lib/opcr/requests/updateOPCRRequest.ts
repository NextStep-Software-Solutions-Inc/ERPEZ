import type { MutationBlueprintFromTemplate, APIResponse, QueryParams } from 'erpez-shared-lib';
import type { UpdateOPCRPayload, OPCRListItem } from '../types';
import api from '@/services/api';

const endpoint = '/opcrs/:id';

export const updateOPCRRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<OPCRListItem>,
  QueryParams,
  UpdateOPCRPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<OPCRListItem>>(finalUrl, payload);
    return response.data;
  },
};
