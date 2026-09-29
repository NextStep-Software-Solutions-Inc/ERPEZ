import { api } from '~/services/api';
import {
  type MutationBlueprintFromTemplate,
  type APIResponse,
} from 'erpez-shared-lib';

const endpoint = '/roles/:id';

export interface UpdateCustomRolePayload {
  name: string;
  description?: string;
  permissionKeys: string[];
}

export const updateCustomRoleRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  UpdateCustomRolePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<string>>(finalUrl, payload);
    return response.data;
  },
};
