using ERPEZ.Shared.Enums;

namespace ERPEZ.Shared.Interfaces;

/// <summary>
/// Resolves an internal ERPEZ tenant identifier from an external organization identity provider identifier.
/// </summary>
public interface IExternalTenantResolver
{
    Task<Guid?> ResolveTenantIdAsync(IdentityProvider provider, string externalOrgId, CancellationToken cancellationToken = default);
}
