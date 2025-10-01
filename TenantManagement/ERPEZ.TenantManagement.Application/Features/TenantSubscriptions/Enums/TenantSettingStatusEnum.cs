namespace ERPEZ.TenantManagement.Application.Features.TenantSubscriptions.Enums;

public enum TenantSettingStatusEnum
{
    Unknown = 0,
    Active = 1,
    Inactive = 2,
    Cancelled = 3,
    PastDue = 4
}
public static class TenantSettingStatusHelper
{
    public static string GetStatusName(TenantSettingStatusEnum? status)
    {
        if (status == null)
        {
            return "Unknown";
        }

        return Enum.GetName(typeof(TenantSettingStatusEnum), status) ?? "Unknown";
    }

    public static TenantSettingStatusEnum GetStatusValue(string? statusName)
    {
        return statusName switch
        {
            "Active" => TenantSettingStatusEnum.Active,
            "Inactive" => TenantSettingStatusEnum.Inactive,
            "Cancelled" => TenantSettingStatusEnum.Cancelled,
            "PastDue" => TenantSettingStatusEnum.PastDue,
            _ => TenantSettingStatusEnum.Unknown
        };
    }
}
