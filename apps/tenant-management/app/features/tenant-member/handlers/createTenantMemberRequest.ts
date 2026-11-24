import { api } from '~/services/api';
import {
  type MutationBlueprintFromTemplate,
  type APIResponse,
} from 'erpez-shared-lib';

const endpoint = '/tenant-members';

export type CreateTenantMemberPayload = {
  email: string;
  firstName: string;
  lastName: string;
  roleIds?: string[];
};

export type CreateTenantMemberResponse = {
  id: string;
  email: string;
  invitationToken: string;
  invitationExpiresAtUtc: string;
};

export const createTenantMemberRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<CreateTenantMemberResponse>,
  undefined,
  CreateTenantMemberPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<CreateTenantMemberResponse>>(finalUrl, payload);
    return response.data;
  },
};
