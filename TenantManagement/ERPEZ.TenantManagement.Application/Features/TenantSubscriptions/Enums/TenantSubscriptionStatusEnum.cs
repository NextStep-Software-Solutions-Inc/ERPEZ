namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Enums;

public enum TenantSubscriptionStatusEnum
{
    Unknown = 0,
    Active = 1,
    Inactive = 2,
    Cancelled = 3,
    PastDue = 4
}
public static class TenantSettingStatusHelper
{
    public static string GetStatusName(TenantSubscriptionStatusEnum? status)
    {
        if (status == null)
        {
            return "Unknown";
        }

        return Enum.GetName(typeof(TenantSubscriptionStatusEnum), status) ?? "Unknown";
    }

    public static TenantSubscriptionStatusEnum GetStatusValue(string? statusName)
    {
        return statusName switch
        {
            "Active" => TenantSubscriptionStatusEnum.Active,
            "Inactive" => TenantSubscriptionStatusEnum.Inactive,
            "Cancelled" => TenantSubscriptionStatusEnum.Cancelled,
            "PastDue" => TenantSubscriptionStatusEnum.PastDue,
            _ => TenantSubscriptionStatusEnum.Unknown
        };
    }
}
