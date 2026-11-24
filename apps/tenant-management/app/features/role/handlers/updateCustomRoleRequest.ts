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
  tenantId?: string;
}

export const updateCustomRoleRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<string>,
  undefined,
  UpdateCustomRolePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const { tenantId, ...body } = payload || ({} as UpdateCustomRolePayload);
    const response = await api.put<APIResponse<string>>(
      finalUrl,
      body,
      tenantId ? { headers: { 'X-Tenant-Id': tenantId } } : undefined
    );
    return response.data;
  },
};
