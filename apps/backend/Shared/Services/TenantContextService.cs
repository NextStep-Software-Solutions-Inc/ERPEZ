using ERPEZ.Shared.Interfaces;

namespace ERPEZ.Shared.Services;

/// <summary>
/// Scoped service for holding the active tenant context for the current request.
/// </summary>
public sealed class TenantContextService : ITenantContextService
{
    private Guid? tenantId;

    public Guid? TenantId => tenantId;

    public bool IsResolved => tenantId.HasValue;

    public void SetTenantId(Guid tenantId)
    {
        this.tenantId = tenantId;
    }
}
