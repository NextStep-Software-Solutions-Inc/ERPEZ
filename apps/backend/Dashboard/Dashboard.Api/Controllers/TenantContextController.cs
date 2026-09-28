using ERPEZ.Shared.Common;
using ERPEZ.Shared.Enums;
using ERPEZ.Shared.Interfaces;
using ERPEZ.Shared.Models;
using ERPEZ.Shared.Security;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
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
    ICurrentUserService currentUser,
    IExternalIdentityNormalizerResolver normalizerResolver) : ControllerBase
{
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

        var normalizer = normalizerResolver.Resolve(User);
        var provider = normalizer.Provider;
        var activeOrgCandidate = normalizer.GetExternalOrganizationId(User);

        // Fetch active, provisioned, non-disabled tenants where caller is an active member under matching provider (Model A)
        var memberships = await dbContext.TenantMembers!
            .AsNoTracking()
            .Where(tm => (tm.ExternalIdentityId == externalId || tm.UserId == externalId) &&
                         tm.Provider == provider &&
                         tm.Status == Status.Active &&
                         !tm.IsDeleted)
            .Include(tm => tm.Tenant)
            .Where(tm => tm.Tenant != null &&
                         !tm.Tenant.IsDeleted &&
                         !tm.Tenant.IsDisabled &&
                         tm.Tenant.AuthProvider == provider &&
                         tm.Tenant.ProvisioningState == TenantProvisioningState.Ready)
            .ToListAsync(cancellationToken);

        var availableTenants = memberships
            .Select(tm => new UnifiedTenantContextDto
            {
                Id = tm.Tenant.Id,
                Name = tm.Tenant.Name,
                ExternalOrgId = tm.Tenant.ExternalOrgId
            })
            .DistinctBy(t => t.Id)
            .ToList();

        UnifiedTenantContextDto? activeTenant = null;
        if (!string.IsNullOrWhiteSpace(activeOrgCandidate))
        {
            activeTenant = availableTenants.FirstOrDefault(t =>
                string.Equals(t.ExternalOrgId, activeOrgCandidate.Trim(), StringComparison.OrdinalIgnoreCase));
        }

        if (activeTenant == null && Request.Headers.TryGetValue("X-Tenant-Id", out var candidateHeader) &&
            Guid.TryParse(candidateHeader, out var candidateGuid))
        {
            activeTenant = availableTenants.FirstOrDefault(t => t.Id == candidateGuid);
        }

        if (activeTenant == null && availableTenants.Count == 1)
        {
            activeTenant = availableTenants[0];
        }

        var response = new TenantBootstrapContextResponse
        {
            ActiveTenant = activeTenant,
            AvailableTenants = availableTenants
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

        var normalizer = normalizerResolver.Resolve(User);
        var provider = normalizer.Provider;

        var availableTenants = await dbContext.TenantMembers!
            .AsNoTracking()
            .Where(tm => (tm.ExternalIdentityId == externalId || tm.UserId == externalId) &&
                         tm.Provider == provider &&
                         tm.Status == Status.Active &&
                         !tm.IsDeleted)
            .Include(tm => tm.Tenant)
            .Where(tm => tm.Tenant != null &&
                         !tm.Tenant.IsDeleted &&
                         !tm.Tenant.IsDisabled &&
                         tm.Tenant.AuthProvider == provider &&
                         tm.Tenant.ProvisioningState == TenantProvisioningState.Ready)
            .Select(tm => new UnifiedTenantContextDto
            {
                Id = tm.Tenant.Id,
                Name = tm.Tenant.Name,
                ExternalOrgId = tm.Tenant.ExternalOrgId
            })
            .Distinct()
            .ToListAsync(cancellationToken);

        return Ok(ApiResponse<List<UnifiedTenantContextDto>>.Success(availableTenants));
    }
}
