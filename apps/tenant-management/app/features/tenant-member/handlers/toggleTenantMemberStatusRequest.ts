import { api } from '~/services/api';
import {
  type MutationBlueprintFromTemplate,
  type APIResponse,
} from 'erpez-shared-lib';

const endpoint = '/tenant-members/:id/status';

export type ToggleTenantMemberStatusPayload = {
  status: number;
  concurrencyStamp: string;
};

export const toggleTenantMemberStatusRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  ToggleTenantMemberStatusPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.patch<APIResponse<string>>(finalUrl, payload);
    return response.data;
  },
};
