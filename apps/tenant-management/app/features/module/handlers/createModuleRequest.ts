import { api } from "~/services/api";
import type {
  MutationBlueprintFromTemplate,
  APIResponse,
} from "erpez-shared-lib";
import { type Module } from "../type/Module";

const endpoint = "/modules";

type CreateModulePayload = {
  name: string;
  description?: string;
};

export const createModuleRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<Module>,
  undefined,
  CreateModulePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.post<APIResponse<Module>>(finalUrl, payload);
    return response.data;
  },
};
