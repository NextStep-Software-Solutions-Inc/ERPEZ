using System.Security.Claims;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Enums;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;

namespace ERPEZ.Shared.Security;

/// <summary>
/// Normalizes Keycloak / Sovereign OIDC session tokens into ERPEZ identity claims.
/// Resolves tenant/workspace identifiers using precedence: 'tenant_id' > 'workspace_id'.
/// </summary>
public class KeycloakIdentityNormalizer : IExternalIdentityNormalizer
{
    public IdentityProvider Provider => IdentityProvider.Keycloak;

    public string GetExternalIdentityId(ClaimsPrincipal principal)
    {
        ArgumentNullException.ThrowIfNull(principal);

        var sub = principal.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? principal.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(sub))
        {
            throw new UnauthorizedException("Missing required 'sub' claim in Keycloak token.");
        }

        return sub.Trim();
    }

    public string? GetExternalOrganizationId(ClaimsPrincipal principal)
    {
        ArgumentNullException.ThrowIfNull(principal);

        // Precedence: tenant_id > workspace_id
        var tenantId = principal.FindFirstValue("tenant_id")
                       ?? principal.FindFirstValue("tenantId")
                       ?? principal.FindFirstValue("workspace_id");

        return string.IsNullOrWhiteSpace(tenantId) ? null : tenantId.Trim();
    }

    /// <summary>
    /// Stamped normalized ERPEZ claims onto the principal's primary identity.
    /// </summary>
    public void NormalizeAndStamp(ClaimsPrincipal principal)
    {
        ArgumentNullException.ThrowIfNull(principal);

        var externalId = GetExternalIdentityId(principal);
        var orgId = GetExternalOrganizationId(principal);

        if (principal.Identity is ClaimsIdentity identity)
        {
            if (!identity.HasClaim(c => c.Type == CustomClaims.IdentityProvider))
            {
                identity.AddClaim(new Claim(CustomClaims.IdentityProvider, Provider.ToString()));
            }

            if (!identity.HasClaim(c => c.Type == CustomClaims.ExternalIdentityId))
            {
                identity.AddClaim(new Claim(CustomClaims.ExternalIdentityId, externalId));
            }

            if (!string.IsNullOrWhiteSpace(orgId) && !identity.HasClaim(c => c.Type == CustomClaims.ExternalOrganizationId))
            {
                identity.AddClaim(new Claim(CustomClaims.ExternalOrganizationId, orgId));
            }
        }
    }
}
