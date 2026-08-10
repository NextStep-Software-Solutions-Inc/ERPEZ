import type { APIResponse, MutationBlueprintFromTemplate  } from 'erpez-shared-lib';
import type { KPIModeOfVerification } from '../types'; 
import api from "@/services/api";


const endpoint = '/kpi-mode-of-verifications/:id';

export type updateKPIModeOfVerificationPayload = {
    kpiId: string;
    name: string;
    description?: string;
    fileId?: string
}

export const updateKPIModeOfVerificationRequest: MutationBlueprintFromTemplate<
    typeof endpoint,
    APIResponse<KPIModeOfVerification>,
    {},
    updateKPIModeOfVerificationPayload
> = {
    endpoint,
    fetcher: async ({ finalUrl, payload }) => {
        const res = await api.put<APIResponse<KPIModeOfVerification>>(finalUrl, payload);
        return res.data;
    },
}