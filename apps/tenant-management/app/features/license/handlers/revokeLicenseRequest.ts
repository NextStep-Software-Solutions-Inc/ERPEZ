import { api } from "~/services/api";
import {
  type APIResponse,
  type MutationBlueprintFromTemplate,
} from "erpez-shared-lib";

const endpoint = "/licenses/:id/revoke";

type PathParams = {
  id: string;
};

type Payload = {
  reason?: string;
};

export const revokeLicenseRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<void>,
  undefined,
  Payload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }): Promise<APIResponse<void>> => {
    const response = await api.post<APIResponse<void>>(finalUrl, payload);
    return response.data;
  },
};
