using ERPEZ.Infrastructure.Persistence;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Api.Controllers;

[ApiController]
[Route("api/tenant")]
[Route("tenants")]
[Authorize]
public class TenantContextController(
    ApplicationDbContext dbContext,
    ITenantRequestContext tenantRequestContext,
    ICurrentUserService currentUser) : ControllerBase
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
        var org = dbContext.Organizations != null
            ? await dbContext.Organizations.AsNoTracking().FirstOrDefaultAsync(o => o.IsActive && !o.IsDeleted, cancellationToken)
            : null;

        var activeTenant = new UnifiedTenantContextDto
        {
            Id = tenantId,
            Name = org?.Name ?? "Default Organization Workspace",
            ExternalOrgId = org?.Code ?? "org_default"
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
        var org = dbContext.Organizations != null
            ? await dbContext.Organizations.AsNoTracking().FirstOrDefaultAsync(o => o.IsActive && !o.IsDeleted, cancellationToken)
            : null;

        var availableTenants = new List<UnifiedTenantContextDto>
        {
            new()
            {
                Id = tenantId,
                Name = org?.Name ?? "Default Organization Workspace",
                ExternalOrgId = org?.Code ?? "org_default"
            }
        };

        return Ok(ApiResponse<List<UnifiedTenantContextDto>>.Success(availableTenants));
    }
}
