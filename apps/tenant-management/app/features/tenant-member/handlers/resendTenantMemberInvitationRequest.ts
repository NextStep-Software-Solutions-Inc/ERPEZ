import { api } from '~/services/api';
import {
  type MutationBlueprintFromTemplate,
  type APIResponse,
} from 'erpez-shared-lib';
import { type CreateTenantMemberResponse } from './createTenantMemberRequest';

const endpoint = '/tenant-members/:id/invitation/resend';

export const resendTenantMemberInvitationRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<CreateTenantMemberResponse>,
  undefined,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<CreateTenantMemberResponse>>(finalUrl);
    return response.data;
  },
};
