import { api } from '~/services/api';
import {
  type MutationBlueprintFromTemplate,
  type APIResponse,
} from 'erpez-shared-lib';

const endpoint = '/tenant-members';

export type CreateTenantMemberPayload = {
  tenantId: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  externalIdentityId?: string;
  roleIds?: string[];
  status?: number | string;
};

export const createTenantMemberRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  CreateTenantMemberPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<string>>(finalUrl, payload);
    return response.data;
  },
};
