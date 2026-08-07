import { api } from "~/services/api";
import {
  type MutationBlueprintFromTemplate,
  type APIResponse,
} from "erpez-shared-lib";
import { type Tenant } from "../type/Tenant";

const endpoint = "/tenants";

type CreateTenantPayload = {
  name: string;
  onPremise: boolean;
  description?: string;
  billingContactEmail: string;
};

export const createTenantRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Tenant>,
  undefined,
  CreateTenantPayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<Tenant>>(finalUrl, payload);
    return response.data;
  },
};
