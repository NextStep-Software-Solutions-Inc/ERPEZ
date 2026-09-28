using System.Security.Claims;
using ERPEZ.Shared.Constants;
using ERPEZ.Shared.Enums;
using ERPEZ.Shared.Interfaces;
using Microsoft.Extensions.Configuration;

namespace ERPEZ.Shared.Security;

public interface IExternalIdentityNormalizerResolver
{
    IExternalIdentityNormalizer Resolve(ClaimsPrincipal principal);
    IExternalIdentityNormalizer Resolve(IdentityProvider provider);
}

public class ExternalIdentityNormalizerResolver(
    IEnumerable<IExternalIdentityNormalizer> normalizers,
    IConfiguration configuration) : IExternalIdentityNormalizerResolver
{
    public IExternalIdentityNormalizer Resolve(IdentityProvider provider)
    {
        var normalizer = normalizers.FirstOrDefault(n => n.Provider == provider);
        if (normalizer == null)
        {
            throw new InvalidOperationException($"No identity normalizer registered for provider '{provider}'.");
        }
        return normalizer;
    }

    public IExternalIdentityNormalizer Resolve(ClaimsPrincipal principal)
    {
        ArgumentNullException.ThrowIfNull(principal);

        // 1. Check existing stamped IdentityProvider claim
        var providerClaim = principal.FindFirstValue(CustomClaims.identityProvider);
        if (Enum.TryParse<IdentityProvider>(providerClaim, true, out var stampedProvider))
        {
            return Resolve(stampedProvider);
        }

        // 2. Check AuthenticationType
        var authType = principal.Identity?.AuthenticationType;
        if (!string.IsNullOrEmpty(authType))
        {
            if (authType.Contains("Clerk", StringComparison.OrdinalIgnoreCase))
            {
                return Resolve(IdentityProvider.Clerk);
            }
            if (authType.Contains("Keycloak", StringComparison.OrdinalIgnoreCase))
            {
                return Resolve(IdentityProvider.Keycloak);
            }
        }

        // 3. Inspect issuer claim if available
        var iss = principal.FindFirstValue("iss");
        if (!string.IsNullOrEmpty(iss))
        {
            var normalizedIss = iss.TrimEnd('/');
            var clerkAuth = configuration.GetValue<string>("Clerk:Authority")?.TrimEnd('/');
            if ((!string.IsNullOrEmpty(clerkAuth) && string.Equals(normalizedIss, clerkAuth, StringComparison.OrdinalIgnoreCase)) ||
                normalizedIss.Contains("clerk", StringComparison.OrdinalIgnoreCase))
            {
                return Resolve(IdentityProvider.Clerk);
            }

            var kcAuth = configuration.GetValue<string>("JwtSettings:Authority")?.TrimEnd('/');
            if (!string.IsNullOrEmpty(kcAuth) && string.Equals(normalizedIss, kcAuth, StringComparison.OrdinalIgnoreCase))
            {
                return Resolve(IdentityProvider.Keycloak);
            }
        }

        // 3b. Inspect sub claim format (Clerk user IDs canonically start with 'user_')
        var sub = principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? principal.FindFirstValue("sub");
        if (!string.IsNullOrWhiteSpace(sub) && sub.StartsWith("user_", StringComparison.OrdinalIgnoreCase))
        {
            return Resolve(IdentityProvider.Clerk);
        }

        // 4. Fallback based on global AUTH_PROVIDER environment/config variable
        var defaultProvider = configuration.GetValue<string>("AUTH_PROVIDER")?.ToLowerInvariant();
        if (defaultProvider == "clerk")
        {
            return Resolve(IdentityProvider.Clerk);
        }

        // Default on-premise fallback is Keycloak
        return Resolve(IdentityProvider.Keycloak);
    }
}
