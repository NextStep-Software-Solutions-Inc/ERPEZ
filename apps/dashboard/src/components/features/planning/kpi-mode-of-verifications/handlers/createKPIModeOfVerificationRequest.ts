import type { APIResponse, MutationBlueprintFromTemplate  } from 'erpez-shared-lib';
import type { KPIModeOfVerification } from '../types'; 
import api from "@/services/api";


const endpoint = '/kpi-mode-of-verifications';

export type CreateKPIModeOfVerificationPayload = {
    kpiId: string;
    name: string;
    description?: string;
    fileId?: string
}

export const createKPIModeOfVerificationRequest: MutationBlueprintFromTemplate<
    typeof endpoint,
    APIResponse<KPIModeOfVerification>,
    {},
    CreateKPIModeOfVerificationPayload
> = {
    endpoint,
    fetcher: async ({ finalUrl, payload }) => {
        const res = await api.post<APIResponse<KPIModeOfVerification>>(finalUrl, payload);
        return res.data;
    },
}