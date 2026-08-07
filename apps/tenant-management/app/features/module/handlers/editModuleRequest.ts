import {
  type APIResponse,
  type MutationBlueprintFromTemplate,
} from "erpez-shared-lib";
import { api } from "~/services/api";
import { type ModuleDetails } from "../type/Module";
const endpoint = "/modules/:id";

type EditModulePayload = {
  name?: string;
  description?: string;
};

export const editModuleRequest: MutationBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<ModuleDetails>,
  undefined,
  EditModulePayload
> = {
  endpoint,
  fetcher: async ({ finalUrl, payload }) => {
    const response = await api.put<APIResponse<ModuleDetails>>(
      finalUrl,
      payload
    );
    return response.data;
  },
};
