import { api } from '~/services/api';
import {
  type MutationBlueprintFromTemplate,
  type APIResponse,
} from 'erpez-shared-lib';

const endpoint = '/tenant-members/:id/invitation/revoke';

export const revokeTenantMemberInvitationRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const response = await api.post<APIResponse<string>>(finalUrl);
    return response.data;
  },
};
