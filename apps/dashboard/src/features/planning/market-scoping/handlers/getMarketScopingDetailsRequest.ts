import type { QueryBlueprintFromTemplate, QueryKey, QueryParams, APIResponse } from "erpez-shared-lib";
import type { MarketScopingForm, ActivityEvidence, ParameterEvaluation, FileAttachment } from "../types/marketScopingTypes";
import type { RawMarketScopingResponseData, RawActivityConducted, RawParameterEvaluation } from "../types/marketScopingApiTypes";
import api from "@/services/api";
import { ACTIVITY_TYPES, NGPA_PARAMETERS } from "../utils/constants";

const endpoint = "/market-scopings/:id" as const;

export interface GetMarketScopingDetailsParams extends QueryParams {
  id?: string;
}

function formatIsoToMmYyyy(dateStr?: string): string {
  if (!dateStr) return "";
  if (/^\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const month = String(d.getUTCMonth() + 1).padStart(2, "0");
      const year = d.getUTCFullYear();
      return `${month}/${year}`;
    }
  } catch {}
  return dateStr;
}

export const getMarketScopingDetailsRequest: QueryBlueprintFromTemplate<
  typeof endpoint,
  APIResponse<MarketScopingForm>,
  GetMarketScopingDetailsParams,
  QueryKey
> = {
  endpoint,
  key: ({ url }) => [url] as const,
  fetcher: async ({ finalUrl, signal }) => {
    const response = await api.get<APIResponse<RawMarketScopingResponseData>>(finalUrl, { signal });
    if (response.data && response.data.data) {
      const raw = response.data.data;
      const activityTypeValues = Object.values(ACTIVITY_TYPES);
      
      const rawActivities = (raw.activitiesConducted && raw.activitiesConducted.length > 0)
        ? raw.activitiesConducted
        : ((raw as unknown as { activities?: RawActivityConducted[] }).activities || []);

      const activities: ActivityEvidence[] = rawActivities.map((a: RawActivityConducted, index: number) => {
        const fallbackConfig = activityTypeValues[index] || {};
        const settingsId = a.activitySettingsId || a.activityId || a.id || `activity-${index}`;
        const rawAttachments = ((a.attachments || []) as unknown) as Array<Record<string, unknown>>;
        
        const attachments: FileAttachment[] = rawAttachments.map((att, attIdx) => {
          const fileUrlStr = String(att.fileUrl || att.url || att.fileId || '');
          return {
            id: String(att.id || att.fileId || fileUrlStr || `att-act-${index}-${attIdx}`),
            fileName: String(att.fileName || att.name || `Document_${attIdx + 1}`),
            fileUrl: fileUrlStr,
            fileSize: typeof att.fileSize === 'number' ? att.fileSize : typeof att.size === 'number' ? att.size : undefined,
            fileType: typeof att.fileType === 'string' ? att.fileType : typeof att.type === 'string' ? att.type : undefined,
            uploadedDate: att.uploadedDate ? new Date(att.uploadedDate as string | Date) : undefined,
          };
        });

        return {
          id: a.id || settingsId,
          activitySettingsId: settingsId,
          activityType: a.activityType || fallbackConfig.label || "Market Scoping Activity",
          label: a.label || fallbackConfig.label || "Market Scoping Activity",
          description: a.description || fallbackConfig.description || "",
          attachments,
          checked: a.checked ?? true,
        };
      });

      const rawParameters = (raw.parameterEvaluations && raw.parameterEvaluations.length > 0)
        ? raw.parameterEvaluations
        : ((raw as unknown as { parameters?: RawParameterEvaluation[] }).parameters || []);

      const parameters: ParameterEvaluation[] = rawParameters.map((p: RawParameterEvaluation, index: number) => {
        const fallbackParam = NGPA_PARAMETERS[index] || {};
        const paramId = p.parameterSettingsId || p.parameterId || `param-${index}`;
        const consideredVal: "Yes" | "No" | "NotApplicable" =
          p.considered || (p.isConsidered === true ? "Yes" : p.isConsidered === false ? "No" : "NotApplicable");
        
        const rawAttachments = ((p.attachments || []) as unknown) as Array<Record<string, unknown>>;

        const attachments: FileAttachment[] = rawAttachments.map((att, attIdx) => {
          const fileUrlStr = String(att.fileUrl || att.url || att.fileId || '');
          return {
            id: String(att.id || att.fileId || fileUrlStr || `att-param-${index}-${attIdx}`),
            fileName: String(att.fileName || att.name || `Document_${attIdx + 1}`),
            fileUrl: fileUrlStr,
            fileSize: typeof att.fileSize === 'number' ? att.fileSize : typeof att.size === 'number' ? att.size : undefined,
            fileType: typeof att.fileType === 'string' ? att.fileType : typeof att.type === 'string' ? att.type : undefined,
            uploadedDate: att.uploadedDate ? new Date(att.uploadedDate as string | Date) : undefined,
          };
        });

        return {
          parameterId: paramId,
          parameterSettingsId: paramId,
          parameterName: p.parameterName || fallbackParam.name || `Parameter ${index + 1}`,
          displayName: p.displayName || p.parameterName || fallbackParam.displayName || `Parameter ${index + 1}`,
          guidedQuestion: p.guidedQuestion || fallbackParam.guidedQuestion || "",
          considered: consideredVal,
          recommendations: p.recommendations || p.remarks || "",
          attachments,
        };
      });

      const mappedForm: MarketScopingForm = {
        ...raw,
        activities,
        parameters,
        periodFrom: formatIsoToMmYyyy(raw.periodFrom),
        periodTo: formatIsoToMmYyyy(raw.periodTo),
        expectedDeliveryDate: formatIsoToMmYyyy(raw.deliveryDate || raw.expectedDeliveryDate),
        agencyName: raw.agencyName || raw.user?.office?.organization?.name || raw.agency || "USTP System",
        departmentUnit: raw.departmentUnit || raw.user?.office?.name || raw.department || "VCRI",
        representativeName: raw.user && (raw.user.firstName || raw.user.lastName)
          ? `${raw.user.firstName || ''} ${raw.user.lastName || ''}`.trim()
          : (raw.representativeName || ""),
        representativeDesignation: raw.user?.personnelPositions?.[0]?.position?.title || raw.representativeDesignation || "",
        signedDocumentFileId: raw.signedDocumentFileId ?? undefined,
        pdfUrl: raw.pdfUrl ?? undefined,
      };

      const resultResponse: APIResponse<MarketScopingForm> = {
        ...response.data,
        data: mappedForm,
      };
      return resultResponse;
    }
    return response.data as unknown as APIResponse<MarketScopingForm>;
  },
};
