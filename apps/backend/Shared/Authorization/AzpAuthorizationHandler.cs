using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;

namespace ERPEZ.Shared.Authorization;

/// <summary>
/// Authorization handler enforcing the 'azp' (authorized party) claim allowlist on user-facing browser endpoints.
/// </summary>
public class AzpAuthorizationHandler(IConfiguration configuration) : AuthorizationHandler<AzpRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, AzpRequirement requirement)
    {
        if (context.User.Identity?.IsAuthenticated != true)
        {
            return Task.CompletedTask;
        }

        var azp = context.User.FindFirstValue("azp");
        if (string.IsNullOrWhiteSpace(azp))
        {
            context.Fail(new AuthorizationFailureReason(this, "The 'azp' claim is mandatory for browser sessions."));
            return Task.CompletedTask;
        }

        var allowedParties = configuration.GetSection("Clerk:AllowedAuthorizedParties").Get<string[]>();
        if (allowedParties == null || allowedParties.Length == 0)
        {
            allowedParties =
            [
                "http://localhost:3000",
                "http://localhost:5173",
                "https://erpez.cloud",
                "https://dashboard.erpez.cloud"
            ];
        }

        var aspnetEnv = configuration["ASPNETCORE_ENVIRONMENT"] ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        var isDevelopment = string.Equals(aspnetEnv, "Development", StringComparison.OrdinalIgnoreCase);

        var normalizedAzp = azp.TrimEnd('/');
        var isAllowed = isDevelopment || allowedParties.Any(party =>
        {
            var p = party.TrimEnd('/');
            if (p == "*" || p.Equals("any", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
            if (p.StartsWith("*."))
            {
                var suffix = p[1..];
                return normalizedAzp.EndsWith(suffix, StringComparison.OrdinalIgnoreCase);
            }
            return string.Equals(p, normalizedAzp, StringComparison.OrdinalIgnoreCase);
        });

        if (isAllowed)
        {
            context.Succeed(requirement);
        }
        else
        {
            context.Fail(new AuthorizationFailureReason(this, $"The authorized party '{azp}' is not in the allowed list."));
        }

        return Task.CompletedTask;
    }
}
