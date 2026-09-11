using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Models;

namespace ERPEZ.Shared.Services;

/// <summary>
/// Scoped request context implementation storing validated tenant governance and infrastructure connection state.
/// </summary>
public sealed class TenantRequestContext : ITenantRequestContext
{
    public TenantAccessContext? AccessContext { get; private set; }
    public TenantDatabaseConnectionInfo? ConnectionInfo { get; private set; }

    public Guid? TenantId => AccessContext?.TenantId;
    public bool IsResolved => AccessContext != null && ConnectionInfo != null;

    public void Initialize(TenantAccessContext accessContext, TenantDatabaseConnectionInfo connectionInfo)
    {
        AccessContext = accessContext ?? throw new ArgumentNullException(nameof(accessContext));
        ConnectionInfo = connectionInfo ?? throw new ArgumentNullException(nameof(connectionInfo));
    }
}
