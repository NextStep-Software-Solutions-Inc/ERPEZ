namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Enums;

public enum TenantSettingBillingCycleEnum
{
    Unknown = 0,
    Monthly = 1,
    Annually = 2
}
public static class TenantSettingBillingCycleHelper
{
    public static string GetBillingCycleName(TenantSettingBillingCycleEnum? billingCycle)
    {
        if (billingCycle == null)
        {
            return "Unknown";
        }

        return Enum.GetName(typeof(TenantSettingBillingCycleEnum), billingCycle) ?? "Unknown";
    }

    public static TenantSettingBillingCycleEnum GetBillingCycleValue(string? billingcycleName)
    {
        return billingcycleName switch
        {
            "Annually" => TenantSettingBillingCycleEnum.Annually,
            "Monthly" => TenantSettingBillingCycleEnum.Monthly,
            _ => TenantSettingBillingCycleEnum.Unknown
        };
    }
}