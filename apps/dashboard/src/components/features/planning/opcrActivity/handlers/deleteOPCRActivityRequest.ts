import type {
    APIResponse,
    MutationBlueprintFromTemplate,
} from 'erpez-shared-lib'
import api from '@/services/api'

const endpoint = '/opcr-activities/:id'

export const deleteOPCRActivityRequest: MutationBlueprintFromTemplate<
    typeof endpoint,
    APIResponse<boolean>
> = {
    endpoint,
    fetcher: async ({ finalUrl }) => {
        const res = await api.delete<APIResponse<boolean>>(finalUrl);
        return res.data;
    },
}