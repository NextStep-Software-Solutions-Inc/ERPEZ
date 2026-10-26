using System.IdentityModel.Tokens.Jwt;
using ERPEZ.Shared.Constants;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace ERPEZ.Shared.Security;

public interface IAuthenticationSchemeRouter
{
    string ResolveScheme(string? issuer);
    string ResolveSchemeFromContext(HttpContext context);
}

public class AuthenticationSchemeRouter(IConfiguration config) : IAuthenticationSchemeRouter
{
    public static string NormalizeIssuer(string? issuer) => issuer?.Trim().TrimEnd('/') ?? string.Empty;

    public string ResolveScheme(string? issuer)
    {
        if (string.IsNullOrWhiteSpace(issuer))
        {
            return AuthSchemes.rejectScheme;
        }

        var normalizedIssuer = NormalizeIssuer(issuer);
        var clerkAuthority = NormalizeIssuer(config.GetValue<string>("Clerk:Authority"));
        var kcAuthority = NormalizeIssuer(config.GetValue<string>("JwtSettings:Authority"));

        if (!string.IsNullOrEmpty(clerkAuthority) && string.Equals(normalizedIssuer, clerkAuthority, StringComparison.Ordinal))
        {
            return AuthSchemes.clerkJwt;
        }

        if (!string.IsNullOrEmpty(kcAuthority) && string.Equals(normalizedIssuer, kcAuthority, StringComparison.Ordinal))
        {
            return AuthSchemes.keycloakJwt;
        }

        // Support development issuer in non-production environments
        var devIssuer = NormalizeIssuer(config.GetValue<string>("JwtSettings:DevIssuer") ?? "https://erpez.dev/auth");
        if (!string.IsNullOrEmpty(devIssuer) && string.Equals(normalizedIssuer, devIssuer, StringComparison.Ordinal))
        {
            return AuthSchemes.keycloakJwt;
        }

        // Strict terminal rejection: unknown issuer must NEVER fall through to another provider
        return AuthSchemes.rejectScheme;
    }

    public string ResolveSchemeFromContext(HttpContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        var authHeader = context.Request.Headers.Authorization.ToString();
        if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            var defaultProvider = config.GetValue<string>("AUTH_PROVIDER")?.ToLowerInvariant();
            return defaultProvider == "clerk" ? AuthSchemes.clerkJwt : AuthSchemes.keycloakJwt;
        }

        var tokenString = authHeader.Substring("Bearer ".Length).Trim();
        try
        {
            var handler = new JwtSecurityTokenHandler();
            if (handler.CanReadToken(tokenString))
            {
                var jwt = handler.ReadJwtToken(tokenString);
                return ResolveScheme(jwt.Issuer);
            }
        }
        catch
        {
            return AuthSchemes.rejectScheme;
        }

        return AuthSchemes.rejectScheme;
    }
}
