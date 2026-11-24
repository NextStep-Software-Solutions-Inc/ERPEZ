using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace ERPEZ.Api.Controllers;

[ApiController]
[Route("api/tenant")]
[Route("tenants")]
[Authorize]
public class TenantContextController(
    ApplicationDbContext dbContext,
    ITenantRequestContext tenantRequestContext,
    ICurrentUserService currentUser,
    IConfiguration configuration) : ControllerBase
{
    private static readonly Guid defaultTenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    [HttpGet("context")]
    [ProducesResponseType(typeof(ApiResponse<TenantBootstrapContextResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetContext(CancellationToken cancellationToken)
    {
        var externalId = currentUser.ExternalIdentityId ?? currentUser.UserId;
        if (string.IsNullOrWhiteSpace(externalId))
        {
            return Unauthorized(ApiResponse<object>.Fail("Authenticated user identity is required."));
        }

        var tenantId = tenantRequestContext.TenantId ?? defaultTenantId;
        var externalOrgIdClaim = User.FindFirst("erpez:external_org_id")?.Value
            ?? User.FindFirst("org_id")?.Value;

        var (tenantName, externalOrgId) = await ResolveTenantDisplayInfoAsync(externalOrgIdClaim, cancellationToken);

        var activeTenant = new UnifiedTenantContextDto
        {
            Id = tenantId,
            Name = tenantName,
            ExternalOrgId = externalOrgId
        };

        var response = new TenantBootstrapContextResponse
        {
            ActiveTenant = activeTenant,
            AvailableTenants = [activeTenant]
        };

        return Ok(ApiResponse<TenantBootstrapContextResponse>.Success(response));
    }

    [HttpGet("available")]
    [ProducesResponseType(typeof(ApiResponse<List<UnifiedTenantContextDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAvailable(CancellationToken cancellationToken)
    {
        var externalId = currentUser.ExternalIdentityId ?? currentUser.UserId;
        if (string.IsNullOrWhiteSpace(externalId))
        {
            return Unauthorized(ApiResponse<object>.Fail("Authenticated user identity is required."));
        }

        var tenantId = tenantRequestContext.TenantId ?? defaultTenantId;
        var externalOrgIdClaim = User.FindFirst("erpez:external_org_id")?.Value
            ?? User.FindFirst("org_id")?.Value;

        var (tenantName, externalOrgId) = await ResolveTenantDisplayInfoAsync(externalOrgIdClaim, cancellationToken);

        var availableTenants = new List<UnifiedTenantContextDto>
        {
            new()
            {
                Id = tenantId,
                Name = tenantName,
                ExternalOrgId = externalOrgId
            }
        };

        return Ok(ApiResponse<List<UnifiedTenantContextDto>>.Success(availableTenants));
    }

    private async Task<(string tenantName, string externalOrgId)> ResolveTenantDisplayInfoAsync(
        string? externalOrgIdClaim,
        CancellationToken cancellationToken)
    {
        // 1. Authoritative operational database active organization
        var org = dbContext.Organizations != null
            ? await dbContext.Organizations.AsNoTracking().FirstOrDefaultAsync(o => o.IsActive && !o.IsDeleted, cancellationToken)
            : null;

        if (!string.IsNullOrWhiteSpace(org?.Name))
        {
            var resolvedOrgId = !string.IsNullOrWhiteSpace(externalOrgIdClaim)
                ? externalOrgIdClaim
                : (!string.IsNullOrWhiteSpace(org.Code) ? org.Code : "org_default");

            return (org.Name.Trim(), resolvedOrgId);
        }

        // 2. Cryptographically signed token-level organization claims (verified by JWT middleware)
        var claimOrgName = User.FindFirst("org_name")?.Value
            ?? User.FindFirst("erpez:org_name")?.Value
            ?? User.FindFirst("organization")?.Value;

        if (!string.IsNullOrWhiteSpace(claimOrgName))
        {
            return (claimOrgName.Trim(), !string.IsNullOrWhiteSpace(externalOrgIdClaim) ? externalOrgIdClaim : "org_default");
        }

        // 3. Client/gateway forwarded tenant name header (untrusted fallback, sanitized)
        if (Request.Headers.TryGetValue("X-Tenant-Name", out var headerName) && !string.IsNullOrWhiteSpace(headerName))
        {
            var headerStr = headerName.ToString().Trim();
            // Sanitize: enforce length limit and avoid control/header injection characters
            if (!string.IsNullOrWhiteSpace(headerStr) && headerStr.Length <= 100)
            {
                return (headerStr, !string.IsNullOrWhiteSpace(externalOrgIdClaim) ? externalOrgIdClaim : "org_default");
            }
        }

        // 4. Configured default or generic workspace fallback
        var configuredName = configuration["Multitenancy:DefaultTenantName"]
            ?? configuration["Tenancy:DefaultTenantName"]
            ?? configuration["App:DefaultTenantName"];

        var fallbackName = !string.IsNullOrWhiteSpace(configuredName)
            ? configuredName.Trim()
            : (!string.IsNullOrWhiteSpace(externalOrgIdClaim) ? externalOrgIdClaim : "Default Workspace");

        return (fallbackName, !string.IsNullOrWhiteSpace(externalOrgIdClaim) ? externalOrgIdClaim : "org_default");
    }
}
