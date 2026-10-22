using System.Security.Claims;
using System.Text.Json;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Enums;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Shared.Security;

/// <summary>
/// Normalizes Clerk v1 and v2 session tokens into ERPEZ identity claims.
/// Handles both flat legacy claims ('org_id') and Clerk v2 nested organization claims ('o.id').
/// </summary>
public class ClerkIdentityNormalizer(ILogger<ClerkIdentityNormalizer>? logger = null) : IExternalIdentityNormalizer
{
    public IdentityProvider Provider => IdentityProvider.Clerk;

    public string GetExternalIdentityId(ClaimsPrincipal principal)
    {
        ArgumentNullException.ThrowIfNull(principal);

        var sub = principal.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? principal.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(sub))
        {
            throw new UnauthorizedException("Missing required 'sub' claim in Clerk token.");
        }

        return sub.Trim();
    }

    public string? GetExternalOrganizationId(ClaimsPrincipal principal)
    {
        ArgumentNullException.ThrowIfNull(principal);

        // 1. Check flat legacy claim 'org_id'
        var flatOrgId = principal.FindFirstValue("org_id");
        if (!string.IsNullOrWhiteSpace(flatOrgId))
        {
            return flatOrgId.Trim();
        }

        // 2. Check nested claim 'o' (Clerk v2 session tokens)
        var nestedOrgClaim = principal.FindFirstValue("o");
        if (!string.IsNullOrWhiteSpace(nestedOrgClaim))
        {
            try
            {
                using var document = JsonDocument.Parse(nestedOrgClaim);
                if (document.RootElement.ValueKind == JsonValueKind.Object &&
                    document.RootElement.TryGetProperty("id", out var idProp) &&
                    idProp.ValueKind == JsonValueKind.String)
                {
                    var orgId = idProp.GetString();
                    if (!string.IsNullOrWhiteSpace(orgId))
                    {
                        return orgId.Trim();
                    }
                }
            }
            catch (JsonException ex)
            {
                logger?.LogWarning(ex, "Failed to parse Clerk nested 'o' claim as JSON: {ClaimValue}", nestedOrgClaim);
            }
        }

        // 3. User is authenticated with no active organization selected
        return null;
    }

    public string? GetExternalOrganizationRole(ClaimsPrincipal principal)
    {
        ArgumentNullException.ThrowIfNull(principal);

        var flatRole = principal.FindFirstValue("org_role");
        if (!string.IsNullOrWhiteSpace(flatRole))
        {
            return flatRole.Trim();
        }

        var nestedOrgClaim = principal.FindFirstValue("o");
        if (!string.IsNullOrWhiteSpace(nestedOrgClaim))
        {
            try
            {
                using var document = JsonDocument.Parse(nestedOrgClaim);
                if (document.RootElement.ValueKind == JsonValueKind.Object)
                {
                    if (document.RootElement.TryGetProperty("rol", out var rolProp) && rolProp.ValueKind == JsonValueKind.String)
                    {
                        var rol = rolProp.GetString();
                        if (!string.IsNullOrWhiteSpace(rol))
                        {
                            return rol.Trim();
                        }
                    }

                    if (document.RootElement.TryGetProperty("role", out var roleProp) && roleProp.ValueKind == JsonValueKind.String)
                    {
                        var role = roleProp.GetString();
                        if (!string.IsNullOrWhiteSpace(role))
                        {
                            return role.Trim();
                        }
                    }
                }
            }
            catch (JsonException ex)
            {
                logger?.LogWarning(ex, "Failed to parse Clerk nested 'o' claim for role as JSON: {ClaimValue}", nestedOrgClaim);
            }
        }

        return null;
    }

    /// <summary>
    /// Stamped normalized ERPEZ claims onto the principal's primary identity.
    /// </summary>
    public void NormalizeAndStamp(ClaimsPrincipal principal)
    {
        ArgumentNullException.ThrowIfNull(principal);

        var externalId = GetExternalIdentityId(principal);
        var orgId = GetExternalOrganizationId(principal);
        var orgRole = GetExternalOrganizationRole(principal);

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

            if (!string.IsNullOrWhiteSpace(orgRole) && !identity.HasClaim(c => c.Type == "org_role"))
            {
                identity.AddClaim(new Claim("org_role", orgRole));
            }
        }
    }
}
