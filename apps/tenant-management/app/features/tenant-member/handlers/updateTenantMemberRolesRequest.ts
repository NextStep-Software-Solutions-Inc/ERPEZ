import { api } from '~/services/api';
import {
  type MutationBlueprintFromTemplate,
  type APIResponse,
} from 'erpez-shared-lib';

const endpoint = '/tenant-members/:id';

export type UpdateTenantMemberRolesPayload = {
  firstName?: string;
  lastName?: string;
  roleIds: string[];
  concurrencyStamp: string;
};

export const updateTenantMemberRolesRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  UpdateTenantMemberRolesPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<string>>(finalUrl, payload);
    return response.data;
  },
};
