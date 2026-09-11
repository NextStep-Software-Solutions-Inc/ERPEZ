using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Models;

namespace ERPEZ.Shared.Services;

/// <summary>
/// Scoped service for holding the active tenant context for the current request.
/// Implements ITenantRequestContext and ITenantContextService.
/// </summary>
public class TenantContextService : ITenantRequestContext
{
    public TenantAccessContext? AccessContext { get; private set; }
    public TenantDatabaseConnectionInfo? ConnectionInfo { get; private set; }

    public Guid? TenantId => AccessContext?.TenantId;
    public bool IsResolved => AccessContext != null && ConnectionInfo != null;

    public void Initialize(TenantAccessContext accessContext, TenantDatabaseConnectionInfo connectionInfo)
    {
        AccessContext = accessContext;
        ConnectionInfo = connectionInfo;
    }
}
