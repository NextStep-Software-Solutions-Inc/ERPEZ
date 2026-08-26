using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace ERPEZ.Shared.Authorization;

/// <summary>
/// Policy provider that dynamically synthesizes policies for permission requirements.
/// </summary>
public class DynamicAuthorizationPolicyProvider(IOptions<AuthorizationOptions> options) 
    : DefaultAuthorizationPolicyProvider(options)
{
    public override async Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        var policy = await base.GetPolicyAsync(policyName);
        if (policy != null)
        {
            return policy;
        }

        // Synthesize dynamic policy requiring the authenticated user to satisfy PermissionRequirement
        return new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .AddRequirements(new PermissionRequirement(policyName))
            .Build();
    }
}
