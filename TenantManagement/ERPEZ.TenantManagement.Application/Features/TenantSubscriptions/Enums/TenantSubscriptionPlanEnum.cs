namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Enums;
public enum TenantSubscriptionPlanEnum
{
    Unknown = 0,
    BasicPlan = 1,
    ProPlan = 2,
    AllModulePlan = 3,
    CompleteBusinessPlan = 4,
    FreeTrialPlan = 5,
}
public static class TenantSettingPlanHelper
{
    public static string GetPlanName(TenantSubscriptionPlanEnum? plan)
    {
        if (plan == null)
        {
            return "Unknown";
        }

        return Enum.GetName(typeof(TenantSubscriptionPlanEnum), plan) ?? "Unknown";
    }

    public static TenantSubscriptionPlanEnum GetPlanValue(string? planName)
    {
        return planName switch
        {
            "BasicPlan" => TenantSubscriptionPlanEnum.BasicPlan,
            "ProPlan" => TenantSubscriptionPlanEnum.ProPlan,
            "AllModulePlan" => TenantSubscriptionPlanEnum.AllModulePlan,
            "CompleteBusinessPlan" => TenantSubscriptionPlanEnum.CompleteBusinessPlan,
            _ => TenantSubscriptionPlanEnum.Unknown
        };
    }
}
