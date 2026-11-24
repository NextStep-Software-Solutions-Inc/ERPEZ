import { api } from '~/services/api';
import {
  type MutationBlueprintFromTemplate,
  type APIResponse,
} from 'erpez-shared-lib';

const endpoint = '/tenant-members/:id';

export const deleteTenantMemberRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<boolean>,
  undefined,
  undefined
> = {
  endpoint,
  fetcher: async ({ finalUrl }) => {
    const res = await api.delete<APIResponse<boolean>>(finalUrl);
    return res.data;
  },
};
