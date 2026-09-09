import { api } from "~/services/api";
import {
  type APIResponse,
  type MutationBlueprintFromTemplate,
} from "erpez-shared-lib";

const endpoint = "/tenants/:id/status";

type PathParams = {
  id: string;
};

type Payload = {
  isDisabled: boolean;
};

export const toggleTenantStatusRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<boolean>,
  undefined,
  Payload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }): Promise<APIResponse<boolean>> => {
    const response = await api.patch<APIResponse<boolean>>(finalUrl, payload);
    return response.data;
  },
};
