namespace ERPEZ.TenantManagement.Domain.Enums;

public enum Plan
{
    Unknown = 0,
    Starter = 1,
    Professional = 2,
    Enterprise = 3,
    OnPremise = 4,

    // Backwards-compatible aliases
    Free = 1,
    Basic = 1,
    Pro = 2
}
