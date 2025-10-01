namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Enums;
public enum TenantSettingPlanEnum
{
    Unknown = 0,
    BasicPlan = 1,
    ProPlan = 2,
    AllModulePlan = 3,
    CompleteBusinessPlan = 4
}
public static class TenantSettingPlanHelper
{
    public static string GetPlanName(TenantSettingPlanEnum? plan)
    {
        if (plan == null)
        {
            return "Unknown";
        }

        return Enum.GetName(typeof(TenantSettingPlanEnum), plan) ?? "Unknown";
    }

    public static TenantSettingPlanEnum GetPlanValue(string? planName)
    {
        return planName switch
        {
            "BasicPlan" => TenantSettingPlanEnum.BasicPlan,
            "ProPlan" => TenantSettingPlanEnum.ProPlan,
            "AllModulePlan" => TenantSettingPlanEnum.AllModulePlan,
            "CompleteBusinessPlan" => TenantSettingPlanEnum.CompleteBusinessPlan,
            _ => TenantSettingPlanEnum.Unknown
        };
    }
}
