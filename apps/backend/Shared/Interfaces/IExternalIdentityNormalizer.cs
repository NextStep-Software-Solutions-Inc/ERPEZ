using System.Security.Claims;
using ERPEZ.Shared.Enums;

namespace ERPEZ.Shared.Interfaces;

/// <summary>
/// Normalizes provider-specific identity tokens into standardized ERPEZ identity concepts.
/// Decouples downstream authorization and tenant pipelines from raw IdP claim topologies.
/// </summary>
public interface IExternalIdentityNormalizer
{
    /// <summary>
    /// The identity provider handled by this normalizer.
    /// </summary>
    IdentityProvider Provider { get; }

    /// <summary>
    /// Extracts the federated subject identifier from the principal.
    /// Throws if sub is missing or invalid.
    /// </summary>
    string GetExternalIdentityId(ClaimsPrincipal principal);

    /// <summary>
    /// Extracts the candidate external organization identifier from the principal, if present.
    /// Returns null if user is authenticated but has no active organization selected.
    /// </summary>
    string? GetExternalOrganizationId(ClaimsPrincipal principal);
}
