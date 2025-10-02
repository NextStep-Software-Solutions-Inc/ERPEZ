namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Enums;

public enum TenantSubscriptionBillingCycleEnum
{
    Unknown = 0,
    Monthly = 1,
    Annually = 2
}
public static class TenantSubscriptionBillingCycleHelper
{
    public static string GetBillingCycleName(TenantSubscriptionBillingCycleEnum? billingCycle)
    {
        if (billingCycle == null)
        {
            return "Unknown";
        }

        return Enum.GetName(typeof(TenantSubscriptionBillingCycleEnum), billingCycle) ?? "Unknown";
    }

    public static TenantSubscriptionBillingCycleEnum GetBillingCycleValue(string? billingcycleName)
    {
        return billingcycleName switch
        {
            "Annually" => TenantSubscriptionBillingCycleEnum.Annually,
            "Monthly" => TenantSubscriptionBillingCycleEnum.Monthly,
            _ => TenantSubscriptionBillingCycleEnum.Unknown
        };
    }
}